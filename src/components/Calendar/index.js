import React, {useEffect, useState} from 'react';
import {Stack, Tab, Tabs, Box, Grid} from "@mui/material";
import CalendarPicker from "./CalendarPicker";
import TimeSlotPicker from "./TimeSlotPicker";
import {useTheme} from "@mui/styles";
import {useSelector} from "react-redux";


function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`
    };
}

function TabPanel({children, value, index, ...other}) {
    return (
        <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`}
             aria-labelledby={`simple-tab-${index}`} {...other}>
            {value === index && <Box sx={{pt: 2}}>{children}</Box>}
        </div>
    );
}


const CustomCalendar = ({allBookingEvents, selectedBookingSlot, slotDuration,userInfo}) => {
    const theme = useTheme();
    const calendarState = useSelector((state) => state.chat);
    const [tab, setTab] = useState(0);
    const [customSelectedDate, setCustomSelectedDate] = useState();
    const [customSelectedTime, setCustomSelectedTime] = useState();
    const [activatedDate, setActivatedDate] = useState();
    const [activatedTime, setActivatedTime] = useState();
    const [duration, setDuration] = useState();

    const handleChangeTab = (event, newTab) => {
        setTab(newTab);
        if (newTab === 0) {
            setActivatedDate(customSelectedDate);
        } else if (newTab === 1) {
            setActivatedTime(customSelectedTime)
        }
    }

    useEffect(() => {
        if (slotDuration) {
            const match = slotDuration.match(/(\d+)/);
            setDuration(match ? match[1] : 30);
        }
    }, []);

    useEffect(() => {
        if (calendarState?.disableSaveBtn?.isDisable === "Y") {
            setCustomSelectedTime("");
        }

    }, [calendarState?.disableSaveBtn?.isDisable]);

    const getCustomSelectedDate = (activatedDate) => {
        setCustomSelectedDate(activatedDate);
    }

    const getCustomSelectedTime = (activeTime) => {
        setCustomSelectedTime(activeTime);
        selectedBookingSlot({date: customSelectedDate, time: activeTime});
    }

    const displayCalendar = () => {
        return (
            <Box sx={{width: "100%", height: "inherit"}}>
                <Stack sx={{
                    width: '100%',
                    background: "#fff",
                    borderRadius: "10px"
                }}>
                    <Tabs sx={{
                        background: userInfo?.botColor || theme.palette.primary.main,
                        justifyContent: "center",
                        margin: "4px 8px",
                        borderRadius: "12px",
                        minHeight: "0",
                        '& .MuiTabs-indicator': {
                            display: 'none',
                        },
                    }} value={tab}
                          onChange={handleChangeTab} aria-label="basic tabs example" centered>
                        <Tab label="Calendar" sx={{
                            width: "46%",
                            background: tab === 0 ? "#fff !important" : "inherit",
                            margin: "6px",
                            borderRadius: "50px",
                            minHeight: "0 !important",
                            padding: "2px 16px",
                            color: tab === 0 ? (userInfo?.botColor || theme.palette.primary.contrastText) : theme.palette.primary.contrastText,
                            fontWeight: 600,
                            '&.Mui-selected': {
                                color: userInfo?.botColor || theme.palette.primary.main,
                            },

                            '&:hover': {
                                color: tab === 0 ? (userInfo?.botColor || theme.palette.primary.main) : theme.palette.primary.contrastText
                            }
                        }} iconPosition="start" {...a11yProps(0)} />
                        <Tab label="Time" disabled={!customSelectedDate} sx={{
                            width: "46%",
                            background: tab === 1 ? "#fff !important" : "inherit",
                            margin: "6px",
                            borderRadius: "50px",
                            minHeight: "0 !important",
                            padding: "2px 16px",
                            color: tab === 1 ? (userInfo?.botColor || theme.palette.primary.contrastText) : theme.palette.primary.contrastText,
                            fontWeight: 600,
                            '&.Mui-selected': {
                                color: userInfo?.botColor || theme.palette.primary.main,
                            },
                            '&:hover': {
                                color: tab === 1 ? (userInfo?.botColor || theme.palette.primary.main) : theme.palette.primary.contrastText
                            }
                        }} iconPosition="start" {...a11yProps(1)} />
                    </Tabs>
                </Stack>
                <Box>
                    <TabPanel value={tab} index={0}>
                        <CalendarPicker getSelectedDate={getCustomSelectedDate} botInfo={userInfo} userSelectedDate={activatedDate}/>
                    </TabPanel>
                    <TabPanel value={tab} index={1}>
                        <TimeSlotPicker selectedDate={customSelectedDate} botInfo={userInfo} userSelectedTime={activatedTime}
                                        busyEvents={allBookingEvents}
                                        selectedTime={getCustomSelectedTime} interval={duration}/>
                    </TabPanel>
                </Box>
            </Box>
        );
    }

    return (
        <Grid container sx={{
            border: `1px solid ${userInfo?.botColor || theme.palette.primary[400]}`,
            borderRadius: "10px",
            width: " 90%",
            height: "400px",
            background: "#fff",
            boxShadow: "2px 2px 6px 0px"
        }}>

            {displayCalendar()}

        </Grid>
    )
}

export default CustomCalendar;
