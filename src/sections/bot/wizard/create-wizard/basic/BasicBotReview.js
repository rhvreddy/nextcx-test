// material-ui
import {Chip, Grid, List, ListItem, ListItemText, Stack, Typography, Box, TextField} from '@mui/material';
import {styled, useTheme} from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import React, {useState, useRef, useEffect} from "react";
import Avatar from "../../../../../components/@extended/Avatar";
import {FileFilled, FileExcelOutlined} from "@ant-design/icons";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

// ==============================|| VALIDATION WIZARD - REVIEW  ||============================== //


const AntSwitch = styled(Switch)(({theme}) => ({
  width: 28,
  height: 16,
  padding: 0,
  marginTop: "10px",
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width: 15
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(9px)'
    }
  },
  '& .MuiSwitch-switchBase': {
    padding: 2,
    '&.Mui-checked': {
      transform: 'translateX(12px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#52c41a' : '#52c41a'
      }
    }
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(['width'], {
      duration: 200
    })
  },
  '& .MuiSwitch-track': {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? '#177ddc' : '#1890ff',
    boxSizing: 'border-box'
  }
}));
AntSwitch.displayName = 'AntSwitch';

export default function BasicBotReview({
                                         botFormData,
                                         setBotFormData,
                                         handleNext,
                                         handleBack,
                                         setErrorIndex,
                                         handleAdvanceView,
                                         botType
                                       }) {
  const [viewAdvance, setViewAdvance] = useState(true);
  const [color, setColor] = useState(botFormData?.botColor)
  const theme = useTheme();
  const handleViewScreen = () => {
    setViewAdvance(!viewAdvance)
    handleAdvanceView(viewAdvance)
  };

  const displayDetailsFromTemplate = () => {
    return (
      <>
        <Grid item xs={12} sm={6}>
          <TextField label="Company Name"
                     value={((botFormData?.companyName && botFormData?.companyName !== "") ? botFormData?.companyName : 'NA') || ""}
                     fullWidth InputProps={{readOnly: true}}/>
        </Grid>
        {(botFormData.creationType !== "Financial Summary") && (botFormData.creationType !== "Loan Management") && <Grid item xs={12} sm={6}>
          <TextField label="Company Website"
                     value={((botFormData?.companyWebsite && botFormData?.companyWebsite !== "") ? botFormData?.companyWebsite : 'NA') || ""}
                     fullWidth InputProps={{readOnly: true}}/>
        </Grid>}
        <Grid item xs={12} sm={6}>
          <TextField label="AI Model"
                     value={((botFormData?.aiModel && botFormData?.aiModel !== "") ? botFormData?.aiModel : 'NA') || ""}
                     fullWidth InputProps={{readOnly: true}}/>
        </Grid>
        <Grid item xs={12} sm={12}>
          <TextField label="Open API Spec"
                     multiline
                     rows={4}
                     value={((botFormData?.openApiSpec && botFormData?.openApiSpec !== "") ? botFormData?.openApiSpec : 'NA') || ""}
                     fullWidth InputProps={{readOnly: true}}/>
        </Grid>
        {(botFormData.creationType === "Financial Summary") || (botFormData.creationType === "Loan Management") && <Grid item xs={12} sm={12}>
          <Typography variant="h7">Business Info Files:</Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              listStyle: 'none',
              border: '1px solid',
              borderColor: theme.palette.grey[300],
              borderRadius: 1,
              minHeight: "56px",
              maxHeight: "56px",
              overflow: "auto",
              p: 1.5,
              m: 0
            }}
            component="ul"
          >
            <Stack flexDirection="row" alignItems="flex-start" flexWrap="wrap" gap="1%" width="100%">
              {botFormData?.customFiles?.length > 0 ? botFormData?.customFiles?.map((chip, i) => (
                <ListItem key={i}
                          sx={{padding: "0 0 10px 0", width: "auto", textOverflow: "ellipsis", overflow: "hidden"}}>
                  <Chip
                    size="small"
                    variant="combined"
                    sx={{height: "30px"}}
                    label={chip.name}
                    icon={chip?.name?.endsWith('.pdf') ?
                      <PictureAsPdfIcon style={{fontSize: '1.5rem', height: "2em"}}/> :
                      <FileExcelOutlined style={{fontSize: '1.2rem'}}/>}
                  />

                </ListItem>
              )) : "NA"
              }
            </Stack>
          </Box>
        </Grid>}
        {botFormData?.creationType === "Lead Generation" && <Grid item xs={12} sm={6}>
          <TextField label="Sales Team Email"
                     value={botFormData.salesTeamEmail || ""}
                     fullWidth InputProps={{readOnly: true}}/>
        </Grid>
        }
        {botFormData?.creationType === "Appointment Booking" && <Grid item xs={12} sm={6}>
          <TextField label="Slot Duration*"
                     value={(botFormData.slotDuration === "custom" ? botFormData.customSlotDuration : botFormData.slotDuration) || ""}
                     fullWidth InputProps={{readOnly: true}}/>
        </Grid>
        }
        {botFormData?.instruction && <Grid item xs={12}>
          <TextField label="Instruction"
                     rows={4}
                     multiline
                     value={botFormData?.instruction || ""}
                     fullWidth InputProps={{readOnly: true}}/>
        </Grid>}
      </>
    )
  }

  const displayDetailsFromScratch = () => {
    return (
      <>
        <Grid item xs={12} sm={6}>
          <TextField label="Bot Description"
                     value={((botFormData?.botDescription && botFormData?.botDescription !== "") ? botFormData?.botDescription : 'NA') || ""}
                     fullWidth InputProps={{readOnly: true}}/>
        </Grid>
        {botFormData?.creationType === "Lead Generation" && <Grid item xs={12} sm={6}>
          <TextField label="Sales Team Email"
                     value={botFormData.salesTeamEmail || ""}
                     fullWidth InputProps={{readOnly: true}}/>
        </Grid>
        }
        <Grid item xs={12} sm={6}>
          <TextField
            placeholder='Bot Theme Color'
            label='Bot Theme Color'
            fullWidth
            value={`rgba(${color.r},${color.g},${color.b},${color.a})`}
            id="uiPrimaryColor"
            InputProps={{
              endAdornment: (
                <>
                  <Grid>
                    <Stack sx={{
                      background: `rgba(${color.r},${color.g},${color.b},${color.a})`,
                      width: "50px",
                      height: "40px",
                      borderRadius: "10px",
                    }}/>
                  </Grid>

                </>
              ), readOnly: true
            }}
          />
        </Grid>
        {botFormData?.creationType === "Appointment Booking" && <Grid item xs={12} sm={6}>
          <TextField label="Slot Duration*"
                     value={(botFormData.slotDuration === "custom" ? botFormData.customSlotDuration : botFormData.slotDuration) || ""}
                     fullWidth InputProps={{readOnly: true}}/>
        </Grid>
        }
        <Grid item xs={12} sm={6}>
          <TextField spellCheck='false'
                     fullWidth
                     value={(botFormData?.botContext && botFormData?.botContext !== "" ? botFormData?.botContext : "NA") || ""}
                     label='Bot Context'
                     InputProps={{readOnly: true}}/>
        </Grid>
        <Grid item xs={12} sm={6}>
        <TextField label="AI Model"
                   value={((botFormData?.aiModel && botFormData?.aiModel !== "") ? botFormData?.aiModel : 'NA') || ""}
                   fullWidth InputProps={{readOnly: true}}/>
      </Grid>
    <Grid item xs={12} sm={12}>
      <TextField label="Open API Spec"
                 rows={4}
                 multiline
                 value={((botFormData?.openApiSpec && botFormData?.openApiSpec !== "") ? botFormData?.openApiSpec : 'NA') || ""}
                 fullWidth InputProps={{readOnly: true}}/>
    </Grid>
        {
          botFormData?.botType === "advance" &&
          <>
            <Grid item xs={12} sm={6}>
              <TextField label="Industry" fullWidth
                         value={((botFormData?.industry) ? botFormData.industry : 'NA') || ""}
                         InputProps={{readOnly: true}}/>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h7">Intents:</Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  listStyle: 'none',
                  border: '1px solid',
                  borderColor: theme.palette.grey[300],
                  borderRadius: 1,
                  minHeight: "50px",
                  maxHeight: "80px",
                  overflow: "auto",
                  p: 1.5,
                  m: 0
                }}
                component="ul"
              >
                <Stack flexDirection="row" alignItems="flex-start" flexWrap="wrap" gap="1%" width="100%">
                  {botFormData?.intents?.length > 0 ? botFormData?.intents?.map((chip, i) => (
                    <ListItem key={i}
                              sx={{padding: "0 0 10px 0", width: "auto", textOverflow: "ellipsis", overflow: "hidden"}}>
                      <Chip
                        size="small"
                        variant="combined"
                        label={chip}
                      />
                    </ListItem>
                  )) : "NA"
                  }
                </Stack>
              </Box>
            </Grid>
          </>
        }
        <Grid item xs={12} sm={12}>
          <Typography variant="h7">Business Info Files:</Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              listStyle: 'none',
              border: '1px solid',
              borderColor: theme.palette.grey[300],
              borderRadius: 1,
              minHeight: "56px",
              maxHeight: "56px",
              overflow: "auto",
              p: 1.5,
              m: 0
            }}
            component="ul"
          >
            <Stack flexDirection="row" alignItems="flex-start" flexWrap="wrap" gap="1%" width="100%">
              {botFormData?.businessInfoAttachments?.length > 0 ? botFormData?.businessInfoAttachments?.map((chip, i) => (
                <ListItem key={i}
                          sx={{padding: "0 0 10px 0", width: "auto", textOverflow: "ellipsis", overflow: "hidden"}}>
                  <Chip
                    size="small"
                    variant="combined"
                    sx={{height: "30px"}}
                    label={chip.name}
                    icon={chip?.name?.endsWith('.pdf') ?
                      <PictureAsPdfIcon style={{fontSize: '1.5rem', height: "2em"}}/> :
                      <FileExcelOutlined style={{fontSize: '1.2rem'}}/>}
                  />

                </ListItem>
              )) : "NA"
              }
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <TextField spellCheck='false'
                     fullWidth
                     value={(botFormData?.verifiedBusinessUrl !== "" ? botFormData?.verifiedBusinessUrl : "NA") || ""}
                     label='Business URL (verified)'
                     InputProps={{readOnly: true}}/>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h7">Business Info URLs:</Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              listStyle: 'none',
              border: '1px solid',
              borderColor: theme.palette.grey[300],
              borderRadius: 1,
              minHeight: "50px",
              maxHeight: "80px",
              overflow: "auto",
              p: 1.5,
              m: 0
            }}
            component="ul"
          >
            <Stack flexDirection="row" alignItems="flex-start" flexWrap="wrap" gap="1%" width="100%">
              {botFormData?.businessUrls?.length > 0 ? botFormData?.businessUrls?.map((chip, i) => (
                <ListItem key={i}
                          sx={{padding: "0 0 10px 0", width: "auto", textOverflow: "ellipsis", overflow: "hidden"}}>
                  <Chip
                    size="small"
                    variant="combined"
                    label={chip?.url}
                  />
                </ListItem>
              )) : "NA"
              }
            </Stack>
          </Box>
        </Grid>
        {botFormData?.instruction && <Grid item xs={12}>
          <TextField label="Instruction"
                     rows={4}
                     multiline
                     value={botFormData?.instruction || ""}
                     fullWidth InputProps={{readOnly: true}}/>
        </Grid>}
      </>
    )
  }


  return (
    <>
      <Typography variant="h5" gutterBottom sx={{mb: 2}} textAlign="center">
        Basic Bot Review summary
      </Typography>

      <Grid container spacing={3} maxHeight={{xs: "40vh", md: window.devicePixelRatio > "1.25" ? "27vh" : "45vh"}}
            sx={{
              overflow: "auto", mb: 2, paddingBottom: "1rem", '::-webkit-scrollbar': {
                width: "4px",
                height: "4px"
              },
              '::-webkit-scrollbar-track': {
                background: "#f1f1f1",
              },
              '::-webkit-scrollbar-thumb': {
                background: "#88888840",
              }
            }}>
        <Grid item xs={12}>
          <Box sx={{display: "flex", justifyContent: "center"}}>
            <Avatar src={botFormData?.avatarFiles?.[0]?.preview} alt='Avatar 1'
                    sx={{width: 72, height: 72, border: '1px dashed'}}/>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="BOT Creation Type" value={botFormData?.creationType || ""} fullWidth
                     InputProps={{readOnly: true}}/>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="BOT Creation From" value={botFormData?.creationFrom || ""} fullWidth
                     InputProps={{readOnly: true}}/>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Bot Name" value={botFormData?.botName || ""} fullWidth InputProps={{readOnly: true}}/>
        </Grid>
        {botFormData?.creationFrom === "Scratch" && displayDetailsFromScratch()}
        {botFormData?.creationFrom === "Template" && displayDetailsFromTemplate()}
      </Grid>

    </>
  );
}
