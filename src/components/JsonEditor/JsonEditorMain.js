import ReactJson from 'react-json-view';
import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/reducers/snackbar';
import Editor from 'react-simple-code-editor';
import PropTypes from 'prop-types';
import './styles.css';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
export default function JsonEditor(props) {
  const height = '50vh';
  const dispatch = useDispatch();
  const [editable, setEditable] = useState(false);
  const [originalData, setOriginalData] = useState(props.data);
  const [onSubmit, setOnSubmit] = useState(false);
  const [jsonString, setJsonString] = useState(JSON.stringify(props.data, null, 2));

  useEffect(() => {
    if (onSubmit && props?.getResponse) {
      props?.getResponse(originalData);
      setOnSubmit(false);
    }
  }, [onSubmit]);

  const hightlightWithLineNumbers = (input, language) =>
    highlight(input, language)
      .split('\n')
      .map((line, i) => `<span class='editorLineNumber'>${i + 1}</span>${line}`)
      .join('\n');

  function getLineNumberOfChar(data, index) {
    if (isNaN(index)) return NaN;
    var perLine = data.split('\n');
    var total_length = 0;
    let i = 0;
    for (i = 0; i < perLine.length; i++) {
      total_length += perLine[i].length + 1;
      if (total_length > index) return i + 1;
    }
  }
  async function jsonValidator() {
    let str = jsonString;
    try {
      setOriginalData(JSON.parse(str));
      setOnSubmit(true);
      setEditable(false);
    } catch (e) {
      let errorCharacter = parseInt(e.message.split(' ').reverse()[0]);
      let errorLine = getLineNumberOfChar(str, errorCharacter);
      let errorLineMessage = '';
      if (isNaN(errorLine)) errorLineMessage = '';
      else errorLineMessage = '.Error at line number : ' + errorLine;
      let errorMessage = e.name + ' :  ' + e.message + errorLineMessage;
      snackbar(errorMessage, 'error');
    }
  }
  const snackbar = (text, status) => {
    dispatch(
      openSnackbar({
        open: true,
        message: text,
        variant: 'alert',
        alert: {
          color: status
        },
        close: false
      })
    );
  };
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ border: 'none' }}>
        {editable ? (
          <div>
            <div
              style={{
                display: 'flex',
                border: '1px solid #0003',
                height: 'max-content',
                maxHeight: height,
                marginBottom: '10px',
                overflowY: 'scroll'
              }}
            >
              <Editor
                value={jsonString}
                onValueChange={(data) => setJsonString(data)}
                highlight={(data) => hightlightWithLineNumbers(data, languages.js)}
                textareaId="codeArea"
                className="editor"
                style={{
                  width: '100%',
                  outline: 0,
                  height: 'max-content'
                }}
              />
            </div>
            <Grid container sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '5px 10px' }} spacing={2}>
              <Grid item>
                <Button
                  variant="contained"
                  onClick={() => {
                    jsonValidator();
                  }}
                >
                  Save
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditable(false);
                  }}
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </div>
        ) : (
          <>
            <Grid container sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 10px' }} spacing={2}>
              <Grid item>
                <b>{props.title}</b>
              </Grid>
              <Grid item>
                <Button variant="contained" onClick={() => setEditable(true)}>
                  Edit
                </Button>
              </Grid>
            </Grid>
            <div
              style={{
                height: 'max-content',
                maxHeight: height,
                overflowY: 'scroll',
                border: '1px solid #0003',
                borderRadius: '5px',
                padding: '20px'
              }}
            >
              <ReactJson src={originalData} enableClipboard={true} iconStyle="circle" displayDataTypes={false} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

JsonEditor.propTypes = {
  data: PropTypes.object.isRequired,
  getResponse: PropTypes.any.isRequired,
  title:PropTypes.string.isRequired
};
