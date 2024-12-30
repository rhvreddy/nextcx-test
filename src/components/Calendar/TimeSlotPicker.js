import React, {useState, useEffect} from "react";
import {Grid, Button} from "@mui/material";
import {dispatch} from "../../store";
import {disableAppointmentSaveBtn} from '../../store/reducers/chat';
import moment from 'moment';
import {useTheme} from "@mui/styles";

const TimeSlotPicker = ({selectedDate, interval, selectedTime, busyEvents,userSelectedTime,botInfo}) => {
    const theme = useTheme();
    const [timeSlots, setTimeSlots] = useState([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const userTimeZone = moment.tz.guess();

    const generateTimeSlots = (startTime, endTime, duration) => {
        const slots = [];
        let currentTime = moment(startTime, "HH:mm");

        while (currentTime.isBefore(moment(endTime, "HH:mm")) || currentTime.isSame(moment(endTime, "HH:mm"))) {
            slots.push(currentTime.format("HH:mm"));
            currentTime.add(duration, 'minutes');
        }

        return slots;
    };

    const updateTimeSlots = (activeDate) => {
        let slotsStartTime = "00:00";
        const slotsEndTime = "23:30";
        const slotsDuration = interval || 30;
        const presentDay = new Date();
        const isToday = moment().isSame(activeDate, 'day');

        if (isToday) {
            let time = moment(presentDay);
            const roundedMinutes = Math.ceil(time.minutes() / 30) * 30;
            if (roundedMinutes === 60) {
                time.add(2, 'hour').minutes(0);
            } else {
                time.add(1, 'hour').minutes(0);
            }
            slotsStartTime = time.format('HH:mm');
        }

        const slots = generateTimeSlots(slotsStartTime, slotsEndTime, slotsDuration);

        // Filter slots to disable busy ones
        const disabledSlots = slots?.map((slot) => {
            const slotTime = moment(slot, "HH:mm");
            let isDisabled = false;

            busyEvents?.forEach((busy) => {
                const busyDate = moment(busy?.start?.dateTime).tz(userTimeZone).format("YYYY-MM-DD");
                if (moment(activeDate).format("YYYY-MM-DD") === busyDate) {
                    const busyStartTime = moment(busy.start.dateTime).tz(userTimeZone).format("HH:mm");
                    const busyEndTime = moment(busy.end.dateTime).tz(userTimeZone).format("HH:mm");

                    if (slotTime.isBetween(moment(busyStartTime, "HH:mm"), moment(busyEndTime, "HH:mm"), null, "[)")) {
                        isDisabled = true;
                    }
                }
            });

            return {time: slot, isDisabled};
        });

        setTimeSlots(disabledSlots);
    };

    useEffect(() => {
        if (selectedDate) {
            updateTimeSlots(new Date(selectedDate));
        }
    }, [selectedDate]);

    useEffect(() => {
        if(userSelectedTime){
            setSelectedTimeSlot(userSelectedTime)
        }
    }, [userSelectedTime]);

    const handleTimeSlotClick = (slot) => {
        if (!slot.isDisabled) {
            setSelectedTimeSlot(slot.time);
            selectedTime(slot.time);
            dispatch(disableAppointmentSaveBtn({isDisable: "N"}));
        }
    };

    return (
        <Grid container spacing={2} sx={{
            overflow: "auto", height: "350px", padding: '0px 5px 0px 18px',
            '::-webkit-scrollbar': {width: "4px", height: "4px"},
            '::-webkit-scrollbar-track': {background: "#f1f1f1"},
            '::-webkit-scrollbar-thumb': {background: "#88888840"}
        }}>
            {timeSlots?.map((slot, index) => (
                <Grid item xs={4} key={index}>
                    <Button
                        variant={selectedTimeSlot === slot?.time ? "contained" : "none"}
                        disabled={slot.isDisabled}
                        sx={{
                            backgroundColor: selectedTimeSlot === slot.time ? (botInfo?.botColor ? botInfo?.botColor : theme.palette.primary.main) : theme.palette.secondary.lighter,
                            fontWeight: '500',
                            textDecoration: slot.isDisabled ? "line-through" : "none",
                            textDecorationColor: slot.isDisabled ? "red" : "inherit",
                            '&:hover': {
                                background: botInfo?.botColor ? botInfo?.botColor : theme.palette.primary.lighter,
                                color:  theme.palette.primary.contrastText
                            }
                        }}
                        onClick={() => handleTimeSlotClick(slot)}
                    >
                        {slot?.time}
                    </Button>
                </Grid>
            ))}
        </Grid>
    );
};

export default TimeSlotPicker;
