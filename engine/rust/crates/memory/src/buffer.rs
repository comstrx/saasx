use std::io::{Error as IoError, ErrorKind, Read, Result as IoResult, Write};
use core::fmt::{Debug, Formatter, Result as FmtResult};
use core::hash::{Hash, Hasher};
use error::{Failure, Result};
use core::iter::repeat_with;
use core::ops::Deref;

use crate::{Buffer, Space};

impl Buffer {

    /// Empty, with room for `capacity` bytes allocated and zeroed once.
    #[inline]
    #[must_use]
    pub fn new ( capacity: usize ) -> Self {

        Self { bytes: vec![0; capacity].into_boxed_slice(), len: 0 }

    }

    /// Holding a copy of the bytes, with exactly their capacity.
    #[inline]
    #[must_use]
    pub fn holding ( bytes: &[u8] ) -> Self {

        Self { bytes: bytes.into(), len: bytes.len() }

    }

    /// Reads from `source` until the buffer is full or the source is at its end; how many bytes came.
    ///
    /// # Errors
    /// The read failed; what was read before stays.
    #[inline]
    pub fn fill ( &mut self, source: &mut impl Read ) -> Result<usize> {

        let start = self.len;

        while let Some(came) = self.read_once(source)? { self.len += came; }

        Ok(self.len - start)

    }

    fn read_once ( &mut self, source: &mut impl Read ) -> Result<Option<usize>> {

        let room = self.room();

        if room.is_empty() { return Ok(None); }

        let came = Self::read(source, room)?;

        Ok((came > 0).then_some(came))

    }

    fn read ( source: &mut impl Read, room: &mut [u8] ) -> Result<usize> {

        let outcome = repeat_with(|| source.read(room))
            .find(|outcome| !matches!(outcome, Err(error) if error.kind() == ErrorKind::Interrupted))
            .unwrap_or(Ok(0));

        match outcome {
            Ok(came)   => Ok(came.min(room.len())),
            Err(error) => Err(Failure::from(error).context("filling a buffer")),
        }

    }

}

impl Default for Buffer {

    #[inline]
    fn default () -> Self {

        Self::new(0)

    }

}

impl Space for Buffer {

    #[inline]
    fn capacity ( &self ) -> usize {

        self.bytes.len()

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

        let end = self.len.checked_add(count).filter(|&end| end <= self.bytes.len()).ok_or_else(Self::exhausted)?;

        self.len = end;

        Ok(self)

    }

}

impl Deref for Buffer {

    type Target = [u8];

    #[inline]
    fn deref ( &self ) -> &[u8] {

        self.as_bytes()

    }

}

impl AsRef<[u8]> for Buffer {

    #[inline]
    fn as_ref ( &self ) -> &[u8] {

        self.as_bytes()

    }

}

impl PartialEq for Buffer {

    #[inline]
    fn eq ( &self, other: &Self ) -> bool {

        self.as_bytes() == other.as_bytes()

    }

}

impl Eq for Buffer {}

impl Hash for Buffer {

    #[inline]
    fn hash <H: Hasher> ( &self, state: &mut H ) {

        self.as_bytes().hash(state);

    }

}

impl Write for Buffer {

    #[inline]
    fn write ( &mut self, buf: &[u8] ) -> IoResult<usize> {

        let take = self.remaining().min(buf.len());

        if take == 0 && !buf.is_empty() { return Err(IoError::new(ErrorKind::StorageFull, "the buffer is full")); }

        let head = buf.get(..take).unwrap_or_default();

        self.push(head).map_err(|failure| IoError::new(ErrorKind::StorageFull, failure))?;

        Ok(take)

    }

    #[inline]
    fn flush ( &mut self ) -> IoResult<()> {

        Ok(())

    }

}

impl Debug for Buffer {

    #[inline]
    #[expect(clippy::renamed_function_params, reason = "the workspace minimum identifier length forbids `f`")]
    fn fmt ( &self, formatter: &mut Formatter<'_> ) -> FmtResult {

        formatter.debug_struct("Buffer").field("capacity", &self.capacity()).field("bytes", &self.as_bytes()).finish()

    }

}
