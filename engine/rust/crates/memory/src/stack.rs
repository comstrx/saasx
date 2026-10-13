use core::fmt::{Debug, Error as FmtError, Formatter, Result as FmtResult, Write};
use core::hash::{Hash, Hasher};
use error::{Failure, Result};
use core::ops::Deref;

use crate::{Space, Stack};

impl <const N: usize> Stack<N> {

    /// How many bytes fit.
    pub const CAPACITY: usize = N;

    /// Empty, every byte zero.
    #[inline]
    #[must_use]
    pub const fn new () -> Self {

        Self { bytes: [0; N], len: 0 }

    }

    /// Holding a copy of the bytes.
    ///
    /// # Errors
    /// The bytes do not fit.
    #[inline]
    pub fn holding ( bytes: &[u8] ) -> Result<Self> {

        let mut stack = Self::new();

        stack.push(bytes)?;

        Ok(stack)

    }

}

impl <const N: usize> Space for Stack<N> {

    #[inline]
    fn capacity ( &self ) -> usize {

        N

    }

    #[inline]
    fn as_bytes ( &self ) -> &[u8] {

        self.bytes.get(..self.len).unwrap_or_default()

    }

    #[inline]
    fn push ( &mut self, bytes: &[u8] ) -> Result<&mut Self> {

        let end  = self.len.checked_add(bytes.len()).ok_or_else(Self::exhausted)?;
        let slot = self.bytes.get_mut(self.len..end).ok_or_else(Self::exhausted)?;

        slot.copy_from_slice(bytes);
        self.len = end;

        Ok(self)

    }

    #[inline]
    fn truncate ( &mut self, len: usize ) {

        self.len = self.len.min(len);

    }

    #[inline]
    fn room ( &mut self ) -> &mut [u8] {

        self.bytes.get_mut(self.len..).unwrap_or_default()

    }

    #[inline]
    fn advance ( &mut self, count: usize ) -> Result<&mut Self> {

        let end = self.len.checked_add(count).filter(|&end| end <= N).ok_or_else(Self::exhausted)?;

        self.len = end;

        Ok(self)

    }

}

impl <const N: usize> Default for Stack<N> {

    #[inline]
    fn default () -> Self {

        Self::new()

    }

}

impl <const N: usize> Deref for Stack<N> {

    type Target = [u8];

    #[inline]
    fn deref ( &self ) -> &[u8] {

        self.as_bytes()

    }

}

impl <const N: usize> AsRef<[u8]> for Stack<N> {

    #[inline]
    fn as_ref ( &self ) -> &[u8] {

        self.as_bytes()

    }

}

impl <const N: usize> PartialEq for Stack<N> {

    #[inline]
    fn eq ( &self, other: &Self ) -> bool {

        self.as_bytes() == other.as_bytes()

    }

}

impl <const N: usize> Eq for Stack<N> {}

impl <const N: usize> Hash for Stack<N> {

    #[inline]
    fn hash <H: Hasher> ( &self, state: &mut H ) {

        self.as_bytes().hash(state);

    }

}

impl <const N: usize> Write for Stack<N> {

    #[inline]
    #[expect(clippy::renamed_function_params, reason = "the workspace minimum identifier length forbids `s`")]
    fn write_str ( &mut self, text: &str ) -> FmtResult {

        self.push_str(text).map(|_| ()).map_err(|Failure { .. }| FmtError)

    }

}

impl <const N: usize> Debug for Stack<N> {

    #[inline]
    #[expect(clippy::renamed_function_params, reason = "the workspace minimum identifier length forbids `f`")]
    fn fmt ( &self, formatter: &mut Formatter<'_> ) -> FmtResult {

        formatter.debug_struct("Stack").field("capacity", &N).field("bytes", &self.as_bytes()).finish()

    }

}
