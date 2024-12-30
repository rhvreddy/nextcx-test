import React, {useState, Fragment, useEffect} from "react";
import {Grid, Stack, Box, List, Button, Typography, ListItem, ListItemText, Dialog} from "@mui/material";
import {makeStyles} from "@mui/styles";
import {useTheme} from "@mui/material/styles";
import UserDetailsForm from "../ManagementForm/UserDetailsForm";
import Header from "../../layout/MainLayout/Header";
import Footer from "../../layout/MainLayout/Footer";
import {dispatch} from "../../store";
import {validateUserPricingForm} from "../../store/reducers/botRecords";
import {toast} from "react-toastify";
import {useSelector} from "react-redux";
import CommonHeader from "../CommonHeader/CommonHeader";

const pricingDetails = [
  {
    description: "Unveil new superpowers and join the Design Leaque",
    duration: "",
    planType: "Enterprise",
    button: "Contact Sales",
    planLists: [
      {
        feature: "All the features of pro plan"
      },
      {
        feature: "Account success Manager"
      },
      {
        feature: "Single Sign-On (SSO)"
      },
      {
        feature: "Collaboration-Soon"
      }
    ]
  }
]

const useStyles = makeStyles((theme) => ({
  billType: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minWidth: "340px",
    minHeight: "70px",
    background: "rgba(255, 255, 255, 1)",
    gap: "2rem",
    boxShadow: "10px 0 15px -5px rgba(0, 0, 0, 0.05), -10px 0 15px -5px rgba(0, 0, 0, 0.05), 0 5px 15px -5px rgba(0, 0, 0, 0.05);",
    borderRadius: "10px"
  },
  billYearly: {
    minWidth: "97px",
    minHeight: "30px",
    color: "rgba(25, 26, 21, 1)",
    fontSize: "18px",
    fontWeight: "500"
  },
  billMonthly: {
    minWidth: "160px",
    minHeight: "56px",
    borderRadius: "10px",
    fontWeight: "500",
    fontSize: "18px"
  },
  mainGrid: {
    display: "flex",
    justifyContent: "center",
    gap: "2rem",
    alignItems: "center"
  },
  mainCard: {
    borderRadius: "20px",
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
  },
  getQuote: {
    borderRadius: "16px",
    fontWeight: "600",
    fontSize: "14px",
    minWidth: "12rem",
    padding: "14px"
  },
  offerTag: {
    minWidth: "5rem",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "14px",
    backgroundColor: "rgba(255, 255, 255, 1)",
    color: "rgba(24, 144, 255, 1)",
    cursor: "default"
  },
  featureList: {
    display: "flex",
    alignItems: "baseline",
    transform: "translateY(-4px)",
    gap: "2px"
  },
  getPlusBtn: {
    minWidth: "12rem",
    padding: "14px",
    fontWeight: "600",
    borderRadius: "16px"
  },
  redeemBtn: {
    minWidth: "12rem",
    padding: "14px",
    fontWeight: "600",
    borderRadius: "16px"
  },
  paymentBtnStack: {
    flexDirection: "row",
    gap: "3rem",
    '@media (max-width: 600px)': {
      flexDirection: "column"
    }
  },
  paymentBtnsGrid: {
    textAlign: 'center',
    border: "1px solid",
    borderRadius: '10px',
    padding: "15px"
  },
  stripeImg: {
    height: '90px',
    display: 'block',
    margin: '0 auto',
    marginBottom: '20px'
  },
  razorpayImg: {
    height: '90px',
    display: 'block',
    margin: '0 auto',
    marginBottom: '20px',
    width: '100%',
    [theme.breakpoints.down("md")]: {
      width: "90%"
    }
  },
  paymentMethodHint: {
    marginTop: "10px",
  },
  note: {
    marginTop: "10px",
    width: "500px",
    [theme.breakpoints.down("sm")]: {
      width: "100%"
    }
  }
}))

const appendBgImg = {
  backgroundImage: "url(https://d3dqyamsdzq0rr.cloudfront.net/prime-app/bot-icons/65ad2dd881f9300019381ded/Ellipse53.png)",
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
}

const Pricing = () => {
  const classes = useStyles()
  const theme = useTheme()
  const profile = useSelector(state => state.profile)
  const [pricingPlans, setPricingPlans] = useState()
  const [openFormDialog, setOpenFormDialog] = useState(false)
  const [userInitialValues, setuserInitialValues] = useState({})
  const [formSubmittedStatus, setFormSubmittedStatus] = useState({isSubmit: false, message: ""})
  const customFormTitle = "Reach Our Sales Department"

  useEffect(() => {
    if (profile?.user?.userId) {
      setuserInitialValues({
        firstName: profile?.user?.firstName,
        lastName: profile?.user?.lastName,
        email: profile?.user?.email,
        companyName: profile?.user?.company
      })
    }
  }, [])

  useEffect(() => {
    setPricingPlans(pricingDetails)
  }, [])

  const getButtonStyles = (index) => {
    const textColor = "rgba(24, 144, 255, 1)";
    const bgColor = "rgba(255, 255, 255, 1)";
    const boxShadow = "4px 4px 4px -1px rgb(0 0 0 / 5%)";
    const styles = {
      color: textColor,
      backgroundColor: bgColor,
      boxShadow: boxShadow
    };
    return styles;
  }

  const handleAddDialog = () => {
    setOpenFormDialog(!openFormDialog)
  }

  const handleGetUserFormDetails = async (data) => {
    if (data?.email) {
      data["emailId"] = data.email
      delete data.email
    }
    const payload = {...data}
    try {
      const response = await dispatch(validateUserPricingForm(payload))
      if (response?.payload?.status?.toLowerCase() === "success") {
        handleAddDialog()
        setFormSubmittedStatus({isSubmit: true, message: "success"})
        toast.success("Thanks for reaching out. Our sales team will get back to you shortly.")
      } else {
        setFormSubmittedStatus({isSubmit: true, message: "error"})
        toast.error(response?.payload?.result?.updationResults?.message ? response?.payload?.result?.updationResults?.message : 'Error occurred please try again later')
      }
    } catch (err) {
      setFormSubmittedStatus({isSubmit: true, message: "error"})
      console.log("err while submitting form")
    }
  }

  const displayGetQuoteForm = () => {
    return (
      <Dialog maxWidth="xs" onClose={handleAddDialog} open={openFormDialog}
              sx={{'& .MuiDialog-paper': {p: 4}}}>
        <UserDetailsForm customFormTitle={customFormTitle} isFormSubmitted={formSubmittedStatus}
                         getFormValues={handleGetUserFormDetails} sourcePage="pricing" onCloseDialog={handleAddDialog}
                         userInitialDetails={userInitialValues}/>
      </Dialog>
    )
  }

  return (
    <Grid container justifyContent="center" overflow="auto">
      <CommonHeader/>
        <Grid item xs={12} sx={{margin:"5rem 0"}} className={classes.mainGrid} flexDirection={{xs: "column", md: "row"}}>
          {
            pricingPlans?.map((plan, index) =>
              <Grid key={index} item xs={9} sm={5} md={3.5}>
                <Stack className={classes.mainCard} sx={{
                  pt: 1.75,
                  backgroundColor: "#ffff"
                }}>
                  <Box sx={{display: "flex", flexDirection: "column", gap: "1rem"}}>
                    <Grid item margin="14px" xs={12} display="flex" justifyContent="center" flexDirection="column"
                          gap="1rem">
                      <Stack flexDirection="row" alignItems="center" gap="8px" justifyContent="center">
                        <div style={{marginBottom: index === 0 ? "-6px" : "0"}}
                             dangerouslySetInnerHTML={{__html: plan?.icon}}/>
                        <Typography
                          color={index === 1 ? "rgba(255, 255, 255, 1)" : "inherit"}
                          variant="h1"
                          marginTop={index === 1 ? "1rem" : "0"}
                          fontSize="24px"
                        >
                          {plan?.planType}
                        </Typography>
                      </Stack>

                      <Stack justifyContent="center" textAlign="center">
                        <Typography color={index === 1 ? "rgba(255, 255, 255, 1)" : "rgba(166, 166, 166, 1)"}
                                    fontSize="16px" fontWeight="500">{plan.description}</Typography>
                      </Stack>
                    </Grid>
                    <Box sx={{borderRadius: "20px", paddingBottom: "1rem"}}>
                      <Grid item xs={12}>
                        <Stack direction="row" spacing={1} gap="1rem" flexDirection="column"
                               justifyContent="center"
                               alignItems="center">
                          {
                            plan?.advanceButton && <Button
                              className={classes.getQuote}
                              variant="contained">{plan?.advanceButton}</Button>
                          }
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sx={{
                        backgroundColor: "rgba(249, 250,251, 1)", borderRadius: "10px", margin: "14px"
                      }}>
                        <List
                          sx={{
                            m: 0,
                            p: 2,
                            paddingBottom: "4rem",
                            '&> li': {
                              px: 0,
                              py: 0.625,
                              '& svg': {
                                fill: theme.palette.success.dark
                              }
                            }
                          }}
                          component="ul"
                        >
                          {plan?.planLists?.map((listChild, i) =>
                            <ListItem key={i}>
                              <ListItemText
                                primary={<Stack flexDirection="row" gap="8px" spacing={1} alignItems="baseline">
                                  <img src="https://d3dqyamsdzq0rr.cloudfront.net/docubaat/images/blue-check-icon.png"
                                       width="20px" height="20px"/>
                                  <Box className={classes.featureList}>
                                    <Typography fontWeight="500" variant="h5">{listChild?.count}</Typography>
                                    <Typography fontWeight="500" variant="h5">{listChild?.feature}</Typography>
                                    <Typography fontWeight="500" variant="h5">{listChild.per}</Typography>
                                  </Box>
                                </Stack>}/>
                            </ListItem>)
                          }
                          <Box textAlign="center" sx={{margin: "14px 0", marginBottom: "4rem"}}>
                            {
                              plan?.button &&
                              <Button
                                className={classes.getPlusBtn}
                                sx={{...getButtonStyles(index)}}
                                onClick={handleAddDialog}
                              >
                                {plan?.button}
                              </Button>
                            }
                          </Box>
                        </List>
                      </Grid>
                    </Box>
                  </Box>
                </Stack>
              </Grid>
            )
          }
        </Grid>
        {displayGetQuoteForm()}
      <Footer customWidth={true}/>
      </Grid>
  )
}

export default Pricing;
