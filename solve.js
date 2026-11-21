// A faster csv-reader 1.0.0: the same policy as its readCsv, written as one scan over the text with
// charCodeAt and slices instead of one character at a time. Every answer is identical to the reference's
// {columns, rows, errors}, its error order and line/row numbers included. Pure: nothing kept between calls.

const COMMA = 1;
const LINE_BREAK = 2;
const END = 3;

const DQ = 34; // "
const COMMA_CODE = 44; // ,
const LF = 10; // \n
const CR = 13; // \r

/** Reads one CSV text, {text, header}: {columns, rows, errors}, as csv-reader 1.0.0 does. */
export function run(input) {
  const text = String(input.text);
  const header = input.header === true;
  const n = text.length;
  const errors = [];
  const rows = [];
  let columns = null;
  let width = -1;

  let pos = 0;
  let line = 1;
  if (n > 0 && text.charCodeAt(0) === 0xfeff) pos = 1;

  let recordLine = 1;
  let recordRow = null;

  // The end of the field last read: COMMA, LINE_BREAK or END.
  let ended = END;

  // Unquoted characters from pos onto `value` up to the next comma or line break (a CR not followed by LF is
  // dropped, stray_cr). Sets `ended` and returns the field's text.
  function readUnquoted(value) {
    let seg = pos;
    while (pos < n) {
      const c = text.charCodeAt(pos);
      if (c === COMMA_CODE) {
        value += text.slice(seg, pos);
        pos += 1;
        ended = COMMA;
        return value;
      }
      if (c === LF) {
        value += text.slice(seg, pos);
        pos += 1;
        line += 1;
        ended = LINE_BREAK;
        return value;
      }
      if (c === CR) {
        if (pos + 1 < n && text.charCodeAt(pos + 1) === LF) {
          value += text.slice(seg, pos);
          pos += 2;
          line += 1;
          ended = LINE_BREAK;
          return value;
        }
        value += text.slice(seg, pos);
        errors.push({ code: 'stray_cr', line: recordLine, row: recordRow });
        pos += 1;
        seg = pos;
        continue;
      }
      pos += 1;
    }
    value += text.slice(seg, pos);
    ended = END;
    return value;
  }

  // A quoted field whose opening quote is at pos.
  function readQuoted() {
    const open = pos;
    const openLine = line;
    let value = '';
    pos += 1;
    let seg = pos;
    let closed = false;
    while (pos < n) {
      const c = text.charCodeAt(pos);
      if (c === DQ) {
        if (pos + 1 < n && text.charCodeAt(pos + 1) === DQ) {
          value += text.slice(seg, pos) + '"';
          pos += 2;
          seg = pos;
          continue;
        }
        value += text.slice(seg, pos);
        pos += 1;
        closed = true;
        break;
      }
      if (c === CR) {
        value += text.slice(seg, pos) + '\n';
        line += 1;
        pos += pos + 1 < n && text.charCodeAt(pos + 1) === LF ? 2 : 1;
        seg = pos;
        continue;
      }
      if (c === LF) line += 1;
      pos += 1;
    }
    if (!closed) {
      pos = open + 1;
      line = openLine;
      errors.push({ code: 'unterminated_quote', line: recordLine, row: recordRow });
      return readUnquoted('"');
    }
    if (pos >= n) {
      ended = END;
      return value;
    }
    const c = text.charCodeAt(pos);
    if (c === COMMA_CODE) {
      pos += 1;
      ended = COMMA;
      return value;
    }
    if (c === LF) {
      pos += 1;
      line += 1;
      ended = LINE_BREAK;
      return value;
    }
    if (c === CR && pos + 1 < n && text.charCodeAt(pos + 1) === LF) {
      pos += 2;
      line += 1;
      ended = LINE_BREAK;
      return value;
    }
    // What follows the closing quote is appended as it stands, up to the next comma or line break.
    const before = value.length;
    const joined = readUnquoted(value);
    if (joined.length > before) errors.push({ code: 'quote_junk', line: recordLine, row: recordRow });
    return joined;
  }

  while (true) {
    // Lines with no characters are no records.
    while (pos < n) {
      const c = text.charCodeAt(pos);
      if (c === LF) {
        pos += 1;
        line += 1;
      } else if (c === CR && pos + 1 < n && text.charCodeAt(pos + 1) === LF) {
        pos += 2;
        line += 1;
      } else {
        break;
      }
    }
    if (pos >= n) break;

    recordLine = line;
    recordRow = header && columns === null ? null : rows.length;
    const fields = [];
    let quoted;
    do {
      quoted = pos < n && text.charCodeAt(pos) === DQ;
      fields.push(quoted ? readQuoted() : readUnquoted(''));
    } while (ended === COMMA);

    // A line that held only stray CRs is left with no characters: no record.
    if (fields.length === 1 && fields[0] === '' && !quoted) continue;

    if (width < 0) width = fields.length;
    if (header && columns === null) {
      columns = fields;
      continue;
    }
    if (fields.length < width) {
      errors.push({ code: 'short_row', line: recordLine, row: recordRow, fields: fields.length });
      while (fields.length < width) fields.push('');
    } else if (fields.length > width) {
      errors.push({ code: 'long_row', line: recordLine, row: recordRow, extra: fields.splice(width) });
    }
    rows.push(fields);
  }
  return { columns: header ? (columns ?? []) : null, rows, errors };
}
