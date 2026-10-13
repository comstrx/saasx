//! The one door into the foundation: every engine crate as a module, lowest layer first, so a
//! consumer declares one dependency and names nothing from the registry. `prelude` gathers the
//! vocabulary of all of them.

#![forbid(unsafe_code)]

pub use validate;
pub use process;
pub use memory;
pub use error;
pub use parse;
pub use file;
pub use http;
pub use log;
pub use net;

/// Every crate's prelude in one.
pub mod prelude {

    pub use validate::prelude::*;
    pub use process::prelude::*;
    pub use memory::prelude::*;
    pub use error::prelude::*;
    pub use parse::prelude::*;
    pub use file::prelude::*;
    pub use http::prelude::*;
    pub use log::prelude::*;
    pub use net::prelude::*;

}
