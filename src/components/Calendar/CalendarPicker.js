import React, {useEffect, useState} from "react";
import {Grid} from "@mui/material";
import moment from 'moment-timezone';
import {styled} from "@mui/system";
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterMoment} from '@mui/x-date-pickers/AdapterMoment';
import {StaticDatePicker} from '@mui/x-date-pickers/StaticDatePicker';
import {useTheme} from "@mui/styles";
import {dispatch} from "../../store";
import {disableAppointmentSaveBtn} from '../../store/reducers/chat'

const CalendarPicker = ({getSelectedDate, userSelectedDate,botInfo}) => {
    const theme = useTheme();
    const userTimeZone = moment.tz.guess();
    const [selectedDate, setSelectedDate] = useState();
    const [currentDate, setCurrentDate] = useState();


    useEffect(() => {
        if (userSelectedDate) {
            setSelectedDate(moment(userSelectedDate).tz(userTimeZone));
        } else {
            setSelectedDate(moment().tz(userTimeZone));
        }

    }, [userSelectedDate]);


    const StyledDatePicker = styled(StaticDatePicker)(({theme}) => ({
        '& .MuiPickersDay-root': {
            color: '#000',
            fontSize: "14px",
            '&.Mui-selected': {
                backgroundColor: botInfo?.botColor ||  theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
            },
            '&:hover': {
                backgroundColor: theme.palette.secondary.light,
                '&.Mui-selected': {
                    backgroundColor: botInfo?.botColor ||  "inherit",
                    color: theme.palette.primary.contrastText,
                },
            },
        },
        '& .MuiPickersCalendarHeader-label': {
            color: '#000',
            fontSize: '18px',
        },
        '& .MuiDayPicker-weekDayLabel': {
            color: '#000',
            fontSize: "14px"
        }
    }));

    useEffect(() => {
        if (selectedDate) {
            const isToday = moment().isSame(selectedDate, 'day');
            let slotsStartTime;
            if (isToday) {
                let time = moment();
                slotsStartTime = time.format('HH:mm');
            }
            if (slotsStartTime && slotsStartTime > "22:30") {
                setCurrentDate(moment().tz(userTimeZone).add(1, 'day'));
                setSelectedDate(moment().tz(userTimeZone).add(1, 'day'))
            } else {
                setCurrentDate(moment().tz(userTimeZone).startOf('day'))
            }
            const newDate = moment(selectedDate).tz(userTimeZone);
            const formattedDate = newDate.format('YYYY-MM-DD');
            getSelectedDate(formattedDate);
        }

    }, [selectedDate]);

    const handleChangeDate = (value) => {
        setSelectedDate(value);
        dispatch(disableAppointmentSaveBtn({isDisable: "Y"}));
    }

    return (
        <Grid container>
            <LocalizationProvider dateAdapter={AdapterMoment}>
                <Grid item xs={12}>
                    <StyledDatePicker
                        displayStaticWrapperAs="desktop"
                        value={selectedDate}
                        minDate={currentDate}
                        maxDate={moment().tz(userTimeZone).add(5, 'months').endOf('month')}
                        onChange={(newValue) => handleChangeDate(newValue)}
                        showToolbar={false}
                        views={['day']}
                        componentsProps={{
                            switchViewButton: {
                                sx: {display: 'none'}
                            }
                        }}
                    />
                </Grid>
            </LocalizationProvider>
        </Grid>
    );
}

export default CalendarPicker;
