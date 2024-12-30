import { makeStyles } from '@mui/styles';
import { Box } from '@mui/system';
import { Accordion, AccordionDetails, AccordionSummary, Button, Grid, Stack, Typography } from '@mui/material';
import { mainAppName } from '../../consts';
import { useSelector } from 'react-redux';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ModelDetailsCard from '../ModelUpgrade/ModelDetailsCard';
import {fetchAIAppsDocument} from '../../store/reducers/botRecords';
import {useDispatch} from 'react-redux';
import { useEffect, useState } from 'react';
import {toast} from "react-toastify";
import { appRoles } from '../../config';

export default function ContactSupport(){
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.profile)
  let [currentUserAppRole, setCurrentUserAppRole] = useState("");
  const [sampleEmailTemplates, setSampleEmailTemplates] = useState({});
  const [faqOptions, setFaqOptions] = useState([
    {summary:{title:"faq title",description:""},details:{description:"description"}}
  ]);

  useEffect(() => {
    console.log(userDetails);
    if(userDetails?.user?.appRoles?.length>0){
      setCurrentUserAppRole(userDetails?.user?.appRoles?.[0]);
    }
  }, [userDetails]);
  const formatFAQList = (faqList)=>{
    return faqList.reduce((accumulator, faq)=>{
      let faqStructure = {
        summary:{
          title:faq?.title || "",
          description:""
        },
        details:{
          description:<FAQSectionDetailsComponent descriptionInfo={{description:faq?.description || ""}}/>
        }
      };
      accumulator.push(faqStructure);
      return accumulator;
    },[])
  }

  useEffect(() => {
    dispatch(fetchAIAppsDocument({documentName:"contactSupport", userId: localStorage.getItem("userId")}))
      .then((action)=>{
        if(action?.error){
          toast.error(action?.payload?.message);
        }
        else{
          setSampleEmailTemplates(action?.payload?.result?.sampleEmailTemplates?.sampleEmailTemplates?.profile || {});
          let formattedFAQList = formatFAQList(action?.payload?.result?.sampleFAQs?.sampleFAQs || []) || [];
          setFaqOptions(formattedFAQList);
        }
      })
      .catch((err)=>{
        toast.error("Error occurred while fetching requested document")
      })
  }, []);
  const AccordionComponent = (props) => {
    const {accordionInfo} = props;
    return (
      <Accordion style={{width: "90%", border:`1px solid #00000122`}}>
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon fontSize={"large"} color={"black"}/>}
        >
          <Grid container style={{
            padding: "5px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            rowGap: "5px"
          }}>
            <Grid item>
              <span style={{fontSize: "20px", fontWeight: "600"}}>{accordionInfo?.summary?.title || ""} </span>
            </Grid>
            <Grid item>
              {accordionInfo?.summary?.description || ""}
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails style={{width:"100%",display: "flex", columnGap: "15px", rowGap: "10px", flexWrap: "wrap"}}>
          {accordionInfo?.details?.description}
        </AccordionDetails>
      </Accordion>
    )
  }

  const SubAccordionComponent = (props) => {
    const {accordionInfo,customStyles} = props;
    return (
      <Accordion style={{width: "100%", border:`1px solid #00000122`}}>
        <AccordionSummary
          sx={{
            "& .MuiAccordionSummary-expandIconWrapper":{
              position:"absolute",
              right:0
            }
          }}
          expandIcon={<ArrowDropDownIcon fontSize={"large"} color={"black"}/>}
        >
          <Grid container style={{
            padding: "0px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            rowGap: "5px"
          }}>
            <Grid item>
              <span style={customStyles?.title || {fontSize: "15px", fontWeight: "600"}}>{accordionInfo?.summary?.title || ""} </span>
            </Grid>
            <Grid item>
              {accordionInfo?.summary?.description || ""}
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails style={{display: "flex", columnGap: "15px", rowGap: "10px", flexWrap: "wrap"}}>
          {accordionInfo?.details?.description}
        </AccordionDetails>
      </Accordion>
    )
  }
  const DetailsComponent = ({iterator,customStyles})=>{
    return(
      <>
        <Box style={{width:"100%", display:"flex",flexDirection:"column",rowGap:"10px"}}>
          {iterator.map((profileOption)=>{
            return(
              <>
                <SubAccordionComponent accordionInfo={profileOption} customStyles={customStyles}/>
              </>
            )
          })}
        </Box>
      </>
    )
  }

  const ProfileSectionDetailsComponent = (props)=>{
    const {descriptionInfo} = props;
    return(
      <>
        <Grid container style={{display:"flex",alignItems:"center",columnGap:"10px"}}>
          <Grid item>
            {descriptionInfo?.description || ""}
          </Grid>
          <Grid item>
            <a target={"_blank"} href={`mailto:contact@nextcx.ai?subject=${sampleEmailTemplates[descriptionInfo?.key] && sampleEmailTemplates[descriptionInfo?.key]["subject"]}&body=${sampleEmailTemplates[descriptionInfo?.key] && sampleEmailTemplates[descriptionInfo?.key]["emailBody"]}`}>Email us</a>
          </Grid>
        </Grid>
      </>
    )
  }

  const FAQSectionDetailsComponent = (props)=>{
    const {descriptionInfo} = props;
    return(
      <>
        <Grid container style={{display:"flex",alignItems:"center",columnGap:"10px"}}>
          <Grid item>
            {descriptionInfo?.description || ""}
          </Grid>
          <Grid item>
            <a target={"_blank"} href={"#"}>Click here</a>
          </Grid>
        </Grid>
      </>
    )
  }

  const menu = useSelector((state) => state.menu)
  const {drawerOpen} = menu;
  const useStyles = makeStyles((theme)=>({
    container: {
      display: "flex",
      flexDirection: "column",
      rowGap: "10px",
      alignItems: "center",
      marginTop: "150px",
      height:"max-content"
    },
    header: {
      position: "fixed",
      zIndex: 1111,
      background: "#ffff",
      padding: "20px 0px 20px 20px",
      boxShadow: "0px -6px 8px rgb(0 0 0)",
      width: drawerOpen ? `calc(100% - 260px)` : `calc(100% - 60px)`,
      '@media screen and (max-width : 1266px)': {
        width: "100% "
      }
    }
  }))
  const styles = useStyles();

  const profileOptions = [
    {
      summary:{
        "title":"Delete",
        "description":"Description about profile delete"
      },
      details:{
        description:<ProfileSectionDetailsComponent descriptionInfo={{description:"details about profile deletion",key:"delete"}}/>
      }
    },
    {
      summary:{
        "title":"Update",
        "description":"Description about profile updation"
      },
      details:{
        description:<ProfileSectionDetailsComponent descriptionInfo={{description:"details about profile updation",key:"update"}}/>
      }
    }
  ]

  const contactSupportOptions = [
    {
      allowedAppRoles:[appRoles['superAdminRole']],
      summary:{
        "title":"Profile",
        "description":"Description about Profile"
      },
      details:{
        description:<DetailsComponent iterator={profileOptions} customStyles={{title:{fontSize:"20px", fontWeight:600}}}/>
      }
    },
    {
      allowedAppRoles: [appRoles['userRole'],appRoles['adminRole'],appRoles["superAdminRole"]],
      summary:{
        "title":"FAQ",
        "description":"Description about FAQ"
      },
      details:{
        description:<DetailsComponent iterator={faqOptions} customStyles={{title:{fontSize:"18px", fontWeight:500}}}/>
      }
    }
  ]

  return(
    <>
      <Box className={styles.header}>
        <Typography variant="h3">Contact Support</Typography>
      </Box>
      <Box className={styles.container}>
        {
          contactSupportOptions.map((option,i)=>{
            return option?.allowedAppRoles?.includes(currentUserAppRole)?<AccordionComponent key={i} accordionInfo={option}/>:<></>;
          })
        }
      </Box>
    </>
  )
}
