import React, {useCallback, useEffect, useRef, useState} from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {addDays, getTimeByMinutes} from "../common/DateTool/DateTool";
import moment = require("moment");
import {ISelectedItem, ITime} from "../common/Types";
import TimePicker from "./TimePicker/TimePicker";
import CustomerInfo from "./CustomerInfo/CustomerInfo";
import "./styles.css";


let tempBookingItems = [
    {
        id: 62,
        displayName: 'European Facials - $65',
        officialName: 'European Facials',
        type: 'package',
    },
    {
        id: 1,
        displayName: 'Body Massage 55 min Deep Tissue - $120',
        officialName: 'Body Massage 55 min Deep Tissue',
        type: 'package',
    },
    {
        id: 2,
        displayName: 'Body Massage 55 min Standard - $80',
        officialName: 'Body Massage 55 min Standard',
        type: 'package',
    }
];

function Booking() {
    const [availableDates, setAvailableDates] = useState([]);
    const [availableTimeForDate, setAvailableTimeForDate] = useState<Array<ITime>>([]);
    const [selectedItem, setSelectedItem] = useState<ISelectedItem>(tempBookingItems[0]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [step, setStep] = useState(1);
    const [captchaToken, setCaptchaToken] = useState(null);

    const getBookingDates = useCallback(async () => {
        let tomorrowDate = moment(new Date(addDays(Date.now(), 1))).format('yyyy-MM-DD');
        const rawResponse = await fetch('/apps/booking/erp/OnlineBooking/GetBookingDates', {
            method: 'POST',
            headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
            body: JSON.stringify({ItemId: selectedItem ? selectedItem.id : 62, Type: "service", Date: tomorrowDate})
        });
        let result = await rawResponse.json();

        setAvailableDates(result);
    }, []);


    const getBookingTime = useCallback(async (selectedDate: Date) => {
        const rawResponse = await fetch('/apps/booking/erp/OnlineBooking/GetBookingTime', {
            method: 'POST',
            headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
            body: JSON.stringify({ItemId: 62, Type: "service", Date: selectedDate})
        });

        let result = (await rawResponse.json()).map(item => {
            return {displayTime: getTimeByMinutes(item.startsAtMinutes), originalTime: item.startsAtMinutes} as ITime;
        });

        setAvailableTimeForDate([...availableTimeForDate, ...result]);
    }, []);




    const handleDropdownOnChange = (e) => {
        let item = tempBookingItems.find(item => item.displayName === e.target.value);
        if (item)
            setSelectedItem(item);
    }

    useEffect(() => {
        getBookingDates().catch(err => console.log("GetBookingTime Error", err));
    }, [selectedItem]);


    useEffect(() => {
        if (selectedDate)
            getBookingTime(selectedDate).catch(err => console.log("GetBookingDate Error", err));
    }, [selectedDate]);


    return (
        <>
            <div className="section-title">
                <h3>Step {step} out of 3</h3>
                <h2>Please select date and time</h2>
            </div>

            {step == 1 &&
			 <>
                {!availableDates ? <div>Loading...</div> :
                    <div className="booking-page_wrapper">
                        <select className="booking-service_dropdown" onChange={(e) => handleDropdownOnChange(e)}>
                            {tempBookingItems.map((item) => <option key={item.id}>{item.displayName}</option>)}
                        </select>
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            includeDates={[...availableDates.map(date => new Date(date))]}
                            showDisabledMonthNavigation
                        />
                        {availableTimeForDate.length > 0 &&

						<TimePicker availableTime={availableTimeForDate} selectedDate={moment(selectedDate).format('dddd, MMMM DD, yyyy')} setStep={setStep} setSelectedTime={setSelectedTime}/>
                        }
                    </div>
                }
                </>
            }
            {(step == 2 || step == 3) && <CustomerInfo selectedDate={selectedDate}
                                                       selectedTime={selectedTime}
                                                       setStep={setStep} step={step}
                                                       setCaptchaToken={setCaptchaToken}
                                                       selectedItem={selectedItem}
                                                       captchaToken={captchaToken}/>}
            {step == 4 && <div>Grats! Confirmed!</div>}
        </>
    );
}

export default Booking;
