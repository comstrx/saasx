use std::env::consts::{ARCH, OS};
use tauri::{AppHandle, command};

use crate::arch::Info;

impl Info {

    pub(crate) fn current ( name: impl Into<String>, version: impl Into<String> ) -> Self {

        Self { platform: Self::platform(OS), arch: ARCH, version: version.into(), name: name.into() }

    }

    fn platform ( system: &str ) -> &'static str {

        match system {
            "linux"   => "linux",
            "macos"   => "macos",
            "windows" => "windows",
            _         => "unknown",
        }

    }

}

#[command]
#[expect(clippy::needless_pass_by_value, reason = "tauri hands a command its handle by value")]
pub(crate) fn host_info ( app: AppHandle ) -> Info {

    let package = app.package_info();

    Info::current(package.name.clone(), package.version.to_string())

}
