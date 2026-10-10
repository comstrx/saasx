//! The gate runner for any workspace in the repository, run from that workspace's root:
//! `cargo run -q --manifest-path <engine>/xtask/Cargo.toml -- <task> [flags]`.
//! CI calls nothing else, so the local gate is the pipeline gate.

#![expect(
    clippy::print_stdout,
    clippy::print_stderr,
    clippy::disallowed_macros,
    reason = "the runner reports to its operator on stdout and stderr"
)]

use core::fmt::{Display, Formatter, Result as FmtResult};
use std::{
    env::{args, current_dir},
    fs::read_dir,
    io::Error as IoError,
    path::{Path, PathBuf},
    process::{Command, ExitCode, Output},
};

type Step = fn(&Gate) -> Result<(), Failure>;
type Entry = (&'static str, &'static str, Step);
/// Fold state while walking `cargo tree`: the open package and the edges counted so far.
type Walk = (Option<Node>, usize);
/// A binary target: `(package, binary)`.
type Binary = (String, String);

/// Needed by `rustfmt` (unstable options) and `cargo udeps`.
const NIGHTLY: &str = "nightly-2026-10-08";

/// Every task: name, help, step. The order is the order of `--help`.
const TASKS: &[Entry] = &[
    ("verify", "fast gate: fmt, clippy, test, doc, audit, boundary", Gate::verify),
    ("full", "verify + vet, udeps, hack, semver; everything CI runs", Gate::full),
    ("check", "compile every crate and target", Gate::check),
    ("fmt", "rustfmt in check mode (--fix rewrites)", Gate::fmt),
    ("clippy", "the lint wall, warnings denied", Gate::clippy),
    ("test", "unit, integration and doc tests", Gate::test),
    ("doc", "rustdoc with warnings denied", Gate::doc),
    ("audit", "cargo deny: advisories, bans, licenses, sources", Gate::audit),
    ("boundary", "a consumer workspace reaches the ecosystem only through the engine", Gate::boundary),
    ("bench", "criterion benchmarks (--run executes)", Gate::bench),
    ("bloat", "release binary size per crate for every binary in the workspace", Gate::bloat),
    ("vet", "cargo vet, offline against supply-chain/", Gate::vet),
    ("udeps", "unused dependencies on nightly", Gate::udeps),
    ("hack", "feature powerset compiles", Gate::hack),
    ("semver", "public API against a git baseline (--baseline <rev>, default main)", Gate::semver),
    ("doctor", "which toolchains and tools are present, then a compile check", Gate::doctor),
];

/// Every external tool: binary, install hint.
const TOOLS: &[(&str, &str)] = &[
    ("cargo-nextest", "cargo binstall cargo-nextest"),
    ("cargo-deny", "cargo binstall cargo-deny"),
    ("cargo-vet", "cargo binstall cargo-vet"),
    ("cargo-udeps", "cargo binstall cargo-udeps"),
    ("cargo-hack", "cargo binstall cargo-hack"),
    ("cargo-bloat", "cargo binstall cargo-bloat"),
    ("cargo-semver-checks", "cargo binstall cargo-semver-checks"),
];

/// Why a task did not succeed.
#[derive(Debug)]
enum Failure {
    Missing { tool: &'static str, install: &'static str, root: PathBuf },
    Command { command: String, code: Option<i32> },
    Spawn { command: String, source: IoError },
    Rule(String),
    Root(IoError),
}

impl Display for Failure {
    #[expect(clippy::renamed_function_params, reason = "the workspace minimum identifier length forbids `f`")]
    fn fmt(&self, formatter: &mut Formatter<'_>) -> FmtResult {
        match self {
            Self::Missing { tool, install, root } => {
                write!(formatter, "`{tool}` is not installed for {}; install it with `{install}`", root.display())
            },
            Self::Command { command, code: Some(code) } => write!(formatter, "`{command}` exited with status {code}"),
            Self::Command { command, code: None } => write!(formatter, "`{command}` was terminated by a signal"),
            Self::Spawn { command, source } => write!(formatter, "could not start `{command}`: {source}"),
            Self::Rule(reason) => write!(formatter, "rule violated: {reason}"),
            Self::Root(source) => write!(formatter, "could not resolve the workspace root: {source}"),
        }
    }
}

/// A `cargo tree` node: a workspace member with its path, or a registry crate without one.
struct Node {
    name: String,
    path: Option<PathBuf>,
}

impl Node {
    /// `<depth><name> v<version>` with ` (<path>)` for workspace members.
    fn parse(line: &str) -> Option<(u32, Self)> {
        let digits = line.chars().take_while(char::is_ascii_digit).count();
        let (depth, rest) = line.split_at_checked(digits)?;
        let (name, tail) = rest.split_once(' ').filter(|(name, _)| !name.is_empty())?;
        let path = tail
            .split_once(" (")
            .and_then(|(_, located)| located.strip_suffix(')'))
            .filter(|path| !path.starts_with("proc-macro") && !path.contains("://"))
            .map(PathBuf::from);

        Some((depth.parse().ok()?, Self { name: name.to_owned(), path }))
    }

    fn under(&self, ancestor: &Path) -> bool {
        self.path.as_deref().is_some_and(|path| path.starts_with(ancestor))
    }

    fn has(&self, file: &str) -> bool {
        self.path.as_deref().is_some_and(|path| path.join(file).is_file())
    }

    /// `(package, binary)` pairs: `src/main.rs` is the package's own binary; each `bloats/<stem>.rs`
    /// (or `<stem>.rs` inside a `bloats` package) is a `bloat-<stem>` probe.
    fn binaries(&self) -> Vec<Binary> {
        let Some(path) = self.path.as_deref() else {
            return Vec::new();
        };
        let probes = if path.ends_with("bloats") { path.to_path_buf() } else { path.join("bloats") };
        let own = self.has("src/main.rs").then(|| self.name.clone());

        own.into_iter()
            .chain(Self::stems(&probes).into_iter().map(|stem| format!("bloat-{stem}")))
            .map(|binary| (self.name.clone(), binary))
            .collect()
    }

    /// The `.rs` file stems directly inside `directory`, if it exists.
    fn stems(directory: &Path) -> Vec<String> {
        read_dir(directory)
            .into_iter()
            .flatten()
            .filter_map(Result::ok)
            .map(|entry| entry.path())
            .filter(|path| path.extension().is_some_and(|extension| extension == "rs"))
            .filter_map(|path| path.file_stem().map(|stem| stem.to_string_lossy().into_owned()))
            .collect()
    }
}
/// A workspace is a consumer when any member depends on a crate outside it; a consumer's
/// `crates/` (or its root package) reach the ecosystem only through that engine, never directly.
struct Rules {
    root: PathBuf,
    crates: PathBuf,
}

impl Rules {
    /// Folds one `cargo tree` line: depth 0 opens a package, depth 1 is one of its direct edges.
    fn step(&self, (owner, edges): Walk, (depth, node): (u32, Node)) -> Result<Walk, Failure> {
        let edges = match (depth, owner.as_ref()) {
            (0, _) => return Ok((Some(node), edges)),
            (1, Some(package)) => self.edge(package, &node).map(|()| edges + 1)?,
            _ => edges,
        };

        Ok((owner, edges))
    }

    fn edge(&self, package: &Node, dependency: &Node) -> Result<(), Failure> {
        let governed = package.under(&self.crates) || package.path.as_deref() == Some(&self.root);

        if !(governed && dependency.path.is_none()) {
            return Ok(());
        }

        Err(Failure::Rule(format!(
            "`{}` depends on `{}` from the registry; crates depend only on the engine, teach it the capability instead",
            package.name, dependency.name
        )))
    }

    /// Whether any member depends on a crate outside the workspace root.
    fn consumer(&self, tree: &str) -> bool {
        tree.lines()
            .filter_map(Node::parse)
            .any(|(depth, node)| depth == 1 && node.path.is_some() && !node.under(&self.root))
    }
}

/// One invocation: the workspace root and the flags that followed the task name.
struct Gate {
    root: PathBuf,
    fix: bool,
    execute: bool,
    baseline: String,
}

impl Gate {
    fn new(flags: &[String]) -> Result<Self, Failure> {
        let has = |name: &str| flags.iter().any(|flag| flag == name);
        let after = |name: &str| flags.iter().position(|flag| flag == name).and_then(|index| flags.get(index + 1));

        Ok(Self {
            root: current_dir().map_err(Failure::Root)?,
            fix: has("--fix"),
            execute: has("--run"),
            baseline: after("--baseline").cloned().unwrap_or_else(|| "main".to_owned()),
        })
    }

    fn verify(&self) -> Result<(), Failure> {
        let steps: [Step; 6] = [Self::fmt, Self::clippy, Self::test, Self::doc, Self::audit, Self::boundary];

        steps.iter().try_for_each(|step| step(self))?;
        println!("verify: every gate passed");

        Ok(())
    }

    fn full(&self) -> Result<(), Failure> {
        let steps: [Step; 5] = [Self::verify, Self::vet, Self::udeps, Self::hack, Self::semver];

        steps.iter().try_for_each(|step| step(self))?;
        println!("full: every gate passed");

        Ok(())
    }

    fn check(&self) -> Result<(), Failure> {
        self.cargo(&["check", "--workspace", "--all-targets", "--all-features", "--locked"])
    }

    fn fmt(&self) -> Result<(), Failure> {
        let nightly = format!("+{NIGHTLY}");
        let check: &[&str] = if self.fix { &[] } else { &["--", "--check"] };

        self.cargo(&[&[nightly.as_str(), "fmt", "--all"], check].concat())
    }

    fn clippy(&self) -> Result<(), Failure> {
        self.cargo(&["clippy", "--workspace", "--all-targets", "--all-features", "--locked", "--", "-D", "warnings"])
    }

    fn test(&self) -> Result<(), Failure> {
        self.require("cargo-nextest")?;
        self.cargo(&["nextest", "run", "--workspace", "--all-features", "--locked", "--no-tests=pass"])?;

        if self.members("src/lib.rs")?.is_empty() {
            return Ok(());
        }

        self.cargo(&["test", "--workspace", "--all-features", "--locked", "--doc"])
    }

    fn doc(&self) -> Result<(), Failure> {
        let arguments = ["doc", "--workspace", "--all-features", "--no-deps", "--locked"];

        self.shell("cargo", &arguments, &[("RUSTDOCFLAGS", "-D warnings")])
    }

    fn audit(&self) -> Result<(), Failure> {
        self.require("cargo-deny")?;
        self.cargo(&["deny", "--all-features", "check", "--config", ".deny.toml"])
    }

    fn bench(&self) -> Result<(), Failure> {
        let mode: &[&str] = if self.execute { &[] } else { &["--no-run"] };

        self.cargo(&[&["bench", "--workspace", "--all-features", "--locked"], mode].concat())
    }

    fn bloat(&self) -> Result<(), Failure> {
        self.require("cargo-bloat")?;

        for (package, binary) in self.binaries()? {
            println!("bloat: `{binary}`");
            self.cargo(&["bloat", "--release", "--locked", "-p", &package, "--bin", &binary, "--crates", "-n", "25"])?;
        }

        Ok(())
    }

    /// Only the engine reaches the registry, so only the engine carries audits.
    fn vet(&self) -> Result<(), Failure> {
        if self.consumer()? {
            println!("vet: consumer workspace, covered by the engine's audits");

            return Ok(());
        }

        self.require("cargo-vet")?;
        self.cargo(&["vet", "--locked"])
    }

    fn udeps(&self) -> Result<(), Failure> {
        self.require("cargo-udeps")?;

        let nightly = format!("+{NIGHTLY}");

        self.cargo(&[&nightly, "udeps", "--workspace", "--all-targets", "--all-features", "--locked"])
    }

    fn hack(&self) -> Result<(), Failure> {
        self.require("cargo-hack")?;
        self.cargo(&["hack", "check", "--workspace", "--feature-powerset", "--depth", "2", "--keep-going", "--locked"])
    }

    fn semver(&self) -> Result<(), Failure> {
        self.require("cargo-semver-checks")?;

        if self.members("src/lib.rs")?.is_empty() {
            println!("semver: no library crate in this workspace");

            return Ok(());
        }

        self.cargo(&["semver-checks", "check-release", "--workspace", "--baseline-rev", &self.baseline])
    }

    fn doctor(&self) -> Result<(), Failure> {
        let nightly = format!("+{NIGHTLY}");
        let probes = TOOLS.iter().map(|(tool, hint)| (*tool, *tool, *hint));
        let toolchain = (nightly.as_str(), NIGHTLY, "rustup toolchain install (see NIGHTLY)");

        for (probe, name, hint) in probes.chain([toolchain]) {
            println!("{}  {name:<20} {hint}", Self::state(Self::available(probe)));
        }

        self.check()
    }

    /// An engine (no outside dependency) is free; a consumer's `crates/` never touch the registry.
    fn boundary(&self) -> Result<(), Failure> {
        let rules = self.rules();
        let tree = self.edges()?;

        if !rules.consumer(&tree) {
            println!("boundary: engine workspace, the registry is allowed");

            return Ok(());
        }

        let (_, edges) =
            tree.lines().filter_map(Node::parse).try_fold((None, 0usize), |state, item| rules.step(state, item))?;

        println!("boundary: {edges} direct edges reach the ecosystem only through the engine");

        Ok(())
    }

    /// Every member that has `file` under its root, e.g. `src/lib.rs` for libraries.
    fn members(&self, file: &str) -> Result<Vec<String>, Failure> {
        Ok(self.nodes()?.into_iter().filter(|node| node.has(file)).map(|node| node.name).collect())
    }

    /// Every `(package, binary)` across the workspace.
    fn binaries(&self) -> Result<Vec<Binary>, Failure> {
        Ok(self.nodes()?.iter().flat_map(Node::binaries).collect())
    }

    fn nodes(&self) -> Result<Vec<Node>, Failure> {
        Ok(self.tree(&["--depth", "0"])?.lines().filter_map(Node::parse).map(|(_, node)| node).collect())
    }

    fn rules(&self) -> Rules {
        Rules { root: self.root.clone(), crates: self.root.join("crates") }
    }

    /// Whether this workspace depends on a crate outside itself.
    fn consumer(&self) -> Result<bool, Failure> {
        Ok(self.rules().consumer(&self.edges()?))
    }

    /// Direct `normal,build` edges of every member, one line per node.
    fn edges(&self) -> Result<String, Failure> {
        self.tree(&["--edges", "normal,build", "--depth", "1", "--no-dedupe"])
    }

    fn tree(&self, extra: &[&str]) -> Result<String, Failure> {
        let base = ["tree", "--workspace", "--prefix", "depth", "--format", "{p}", "--locked"];

        self.capture("cargo", &[&base[..], extra].concat())
    }

    fn cargo(&self, arguments: &[&str]) -> Result<(), Failure> {
        self.shell("cargo", arguments, &[])
    }

    fn shell(&self, program: &str, arguments: &[&str], environment: &[(&str, &str)]) -> Result<(), Failure> {
        let command = Self::describe(program, arguments);

        println!("> {command}");

        let status = Command::new(program)
            .args(arguments)
            .envs(environment.iter().copied())
            .current_dir(&self.root)
            .status()
            .map_err(|source| Failure::Spawn { command: command.clone(), source })?;

        if status.success() { Ok(()) } else { Err(Failure::Command { command, code: status.code() }) }
    }

    fn capture(&self, program: &str, arguments: &[&str]) -> Result<String, Failure> {
        let command = Self::describe(program, arguments);
        let Output { status, stdout, .. } = Command::new(program)
            .args(arguments)
            .current_dir(&self.root)
            .output()
            .map_err(|source| Failure::Spawn { command: command.clone(), source })?;

        if !status.success() {
            return Err(Failure::Command { command, code: status.code() });
        }

        Ok(String::from_utf8_lossy(&stdout).into_owned())
    }

    fn require(&self, tool: &'static str) -> Result<(), Failure> {
        let install = TOOLS.iter().find(|(name, _)| *name == tool).map_or("", |(_, hint)| hint);

        if Self::available(tool) { Ok(()) } else { Err(Failure::Missing { tool, install, root: self.root.clone() }) }
    }

    /// Cargo plugins and `+toolchain` are probed through `cargo … --version`.
    fn available(program: &str) -> bool {
        let (program, prefix) = match program.strip_prefix("cargo-") {
            Some(plugin) => ("cargo", Some(plugin)),
            None if program.starts_with('+') => ("cargo", Some(program)),
            None => (program, None),
        };

        Command::new(program).args(prefix).arg("--version").output().is_ok_and(|output| output.status.success())
    }

    const fn state(present: bool) -> &'static str {
        if present { "ok     " } else { "missing" }
    }

    fn describe(program: &str, arguments: &[&str]) -> String {
        arguments.iter().fold(program.to_owned(), |mut text, argument| {
            text.push(' ');
            text.push_str(argument);
            text
        })
    }
}

fn main() -> ExitCode {
    let mut arguments = args().skip(1);

    let name = arguments.next().unwrap_or_default();
    let flags: Vec<String> = arguments.collect();

    let Some((_, _, step)) = TASKS.iter().find(|(task, ..)| *task == name) else {
        eprintln!("usage: xtask <task> [--fix] [--run] [--baseline <rev>]  (run from a workspace root)\n");

        for (task, help, _) in TASKS {
            eprintln!("  {task:<10} {help}");
        }

        return ExitCode::FAILURE;
    };

    match Gate::new(&flags).and_then(|gate| step(&gate)) {
        Ok(()) => ExitCode::SUCCESS,
        Err(failure) => {
            eprintln!("xtask: {failure}");

            ExitCode::FAILURE
        },
    }
}
