// material-ui
import {
  Grid,
  TextField,
  Stack,
  Link,
  Tooltip,
  CardContent, InputLabel, InputAdornment, Box
} from '@mui/material';
import React, {useState, useEffect} from 'react';
import MainCard from '../MainCard';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import IconButton from '../../../../../components/@extended/IconButton';
import {CopyOutlined} from '@ant-design/icons';
import {useDispatch} from 'store';
import {REACT_APP_CF_URL, REACT_APP_APP_BACK_END_BASE_URL} from 'config';
import {toast} from "react-toastify";

// ==============================|| VALIDATION WIZARD - REVIEW  ||============================== //


export default function BotInfoViewForm({botId, version, publishStatus}) {
  const dispatch = useDispatch();
  const [htmlSnippet, setHtmlSnippet] = useState('');
  const [htmlSnippetScript, setHtmlSnippetScript] = useState('');
  const [htmlSnippetDiv, setHtmlSnippetDiv] = useState('');
  const [testURL, setTestURL] = useState('');

  useEffect(() => {
    setHtmlSnippet(`<script src=\"${REACT_APP_CF_URL}/js/nextcx-ai-chat-widget-soks-global-v1.js\" type=\"text/javascript\"></script><div id=\"siaai-x2n331-widget-container\"  bot-lang=\"en\"  bot-id='${botId}'  icon_name=\"san-logo.png\"  bot-auth-key=\"HYYIYBHSHJSDJSDJK\"  class=\"sia-ai-v-css\" ></div>`);
    setHtmlSnippetScript(`<script src=\"${REACT_APP_CF_URL}/js/nextcx-ai-chat-widget-soks-global-v1.js\" type=\"text/javascript\"></script>`);
    setHtmlSnippetDiv(`<div id=\"sia-x2n331-widget-container\"  bot-lang=\"en\"  bot-id='${botId}'  icon_name=\"san-logo.png\"  bot-auth-key=\"HYYIYBHSHJSDJSDJK\"  class=\"sia-ai-v-css\" ></div>`);
    setTestURL(`${REACT_APP_APP_BACK_END_BASE_URL}/ai-demo/html/pages/nextcx-ai-v1.html?botId=${botId}&version=${version}&mode=admin`);
  }, []);

  return (
    <Grid container spacing={2}>
      {publishStatus === "Y" &&
        <Grid item xs={12} sx={{m: 1.5}} md={12}>
          <MainCard
            title='Code snippet'
            secondary={
              <CopyToClipboard
                text={htmlSnippet}
                onCopy={() =>
                  toast.success("Text Copied")
                }
              >
                <Tooltip title='Copy'>
                  <IconButton size='large'>
                    <CopyOutlined/>
                  </IconButton>
                </Tooltip>
              </CopyToClipboard>
            }
          >
            <CardContent sx={{p: 0, pb: 2.5}}>{htmlSnippetScript}</CardContent>
            <CardContent sx={{p: 0, pb: 2.5}}>{htmlSnippetDiv}</CardContent>
          </MainCard>
        </Grid>}
      <Grid item xs={12} md={12} sm={12} sx={{m: 3}}>
        <Stack spacing={0.5}>
          <InputLabel sx={{color: '#000000f2', fontWeight: 'bold'}}>Test URL</InputLabel>
          <Box sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "1px solid #e6ebf1",
            padding: "0 12px"
          }}>
            <Link target='_blank' href={testURL}>{testURL}</Link>
            <CopyToClipboard
              text={testURL}
              onCopy={() => toast.success("Text Copied")}
            >
              <Tooltip title='Copy'>
                <IconButton aria-label='Copy from another element' color='primary' edge='end' size='large'>
                  <CopyOutlined/>
                </IconButton>
              </Tooltip>
            </CopyToClipboard>
          </Box>
        </Stack>
      </Grid>
    </Grid>
  );
}
