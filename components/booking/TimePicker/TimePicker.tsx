import React, {useCallback, useEffect, useState} from "react";
import {ITime} from "../../common/Types";

interface IProps {
    selectedDate: string;
    availableTime: Array<ITime>;
    setStep: Function;
    setSelectedTime: Function;
}

const TimePicker = (props: IProps) => {
    const { availableTime, selectedDate, setStep, setSelectedTime } = props;

    const handleOnClick = (time) => {
        setStep(2);
        setSelectedTime(time);
    }


    return (
        <div className="time-picker_container">
            <p className="time-picker_title">{selectedDate}</p>
            <div className="time-items">
                {availableTime.map((item, index) => <div key={index} className="time-item" onClick={() => handleOnClick(item.originalTime)}>{item.displayTime}</div>)}
            </div>
        </div>
    )
}

export default TimePicker;
