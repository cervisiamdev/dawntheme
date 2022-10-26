import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";

import {getTimeByMinutes} from "../../common/DateTool/DateTool";
import config from "../Square/paymentForm";
import {reCaptchaKey} from "../../common/env";
import ReCAPTCHA from "react-google-recaptcha";
import {ISelectedItem} from "../../common/Types";
import { string, boolean} from "yup";
import "yup-phone";
import moment = require("moment");

interface IProps {
    selectedDate: string;
    selectedTime: string;
    step: number;
    setStep: Function;
    setCaptchaToken: Function;
    selectedItem: ISelectedItem;
    captchaToken: string;
}

const phoneRegExp = /^(|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/

const CustomerInfo = (props: IProps) => {
    const {selectedDate, selectedTime, setStep, step, setCaptchaToken, selectedItem, captchaToken } = props;
    const [isLoad, setLoad] = useState(false);
    const [cardNonce, setCardNonce] = useState(null);
    const [billingPostalCode, setBillingPostalCode] = useState(null);
    const [lastStepError, setLastStepError] = useState(null);
    const [formValues, setFormValues] = useState({
        "customer_first-name" : "",
        "customer_last-name" : "",
        "customer_email": "",
        "customer_phone": "",
        "cardholder_name": "",
        "email-checkbox": false,
        "phone-checkbox": false,
        "email_newsletter": false,
        "text_marketing": false,
        "firs_visit": false,
    });
    const [formValidation, setFormValidation] = useState({
        "customer_first-name": true,
        "customer_last-name": true,
        "customer_email": true,
        "customer_phone": true,
        "cardholder_name": true,
        "email-checkbox": true,
        "phone-checkbox": true
    });
    const recaptchaRef = useRef();



    useEffect(() => {
        let sqPaymentScript = document.createElement("script");
        // sandbox: https://js.squareupsandbox.com/v2/paymentform
        // production: https://js.squareup.com/v2/paymentform
        sqPaymentScript.src = "https://js.squareup.com/v2/paymentform";
        sqPaymentScript.type = "text/javascript";
        sqPaymentScript.async = false;
        sqPaymentScript.onload = () => {
            setLoad(true);
        };
        document.getElementsByTagName("head")[0].appendChild(sqPaymentScript);
    }, []);


    const paymentForm = useMemo(() => {
            if (isLoad)
                //@ts-ignore
                return new window.SqPaymentForm(config);
    }, [isLoad])


    useEffect(() => {
        if(paymentForm)
            paymentForm.build();
    }, [paymentForm])


    useEffect(() => {
        const onCardNonceEvent = (event) => {
            setCardNonce(event.detail.cardNonce);
            setBillingPostalCode(event.detail.billingPostalCode);
        };

        document.getElementById("card-nonce").addEventListener('cardNonceEvent', onCardNonceEvent);
        return () => {
            document.getElementById("card-nonce").removeEventListener('cardNonceEvent', onCardNonceEvent);
        }
    }, []);

    const handleChangeStep = async (nextStep) => {
        switch (step) {
            case 1:
                setStep(nextStep);
                break;
            case 2:
                paymentForm.requestCardNonce();
                //@ts-ignore
                setCaptchaToken(await recaptchaRef.current.executeAsync());
                setStep(nextStep);
                break;
            case 3:
                let result = await bookingAppointment();
                if (!result.Error) {
                    setLastStepError(null);
                    setStep(nextStep);
                } else {
                    setLastStepError(result.Error)
                }
                break;
        }
    }

    const handleChangeFormValues = useCallback((e) => {
        setFormValues({ ...formValues, [e.target.id]: e.target.type == "checkbox" ? e.target.checked : e.target.value});
        //@ts-ignore
        if(document.getElementById("both-checkbox").checked == true){
            //@ts-ignore
            document.getElementById("email-checkbox").checked = true; document.getElementById("phone-checkbox").checked = true;
        }
         //@ts-ignore
        setFormValidation({...formValidation, ...{["email-checkbox"]: document.getElementById("email-checkbox").checked, ["phone-checkbox"]: document.getElementById("phone-checkbox").checked}})
        console.log(formValidation)
        // setFormValidation({...formValidation,
        //     [e.target.id]: e.target.id == "customer_email" ? string().email().required().isValidSync(e.target.value) :
        //         (e.target.id == "customer_phone" ? string().phone().required().isValidSync(e.target.value) : string().required().isValidSync(e.target.value))
        // })
    }, [formValues])


    const handleOnBlurInput = (controlId) => {
            setFormValidation({...formValidation,
                [controlId]: controlId == "customer_email" ? string().email().required().isValidSync(formValues[controlId]) :
                  (controlId == "customer_phone" ? string().matches(phoneRegExp, "Phone number is not valid").required().isValidSync(formValues[controlId])
                      : string().required().isValidSync(formValues[controlId]))
            })

    };

    // const handleCheckboxChanged = (controlId, value) => {
    //     if(controlId == "both-checkbox"){
    //         setFormValidation({...formValidation, ...{["email-checkbox"]: value, ["phone-checkbox"]: value} })
    //     }
    //     else {
    //         setFormValidation({...formValidation, [controlId]: value})
    //     }
    // }

    const bookingAppointment = async () => {
        const rawResponse = await fetch('/apps/booking/erp//OnlineBooking/ScheduleTime', {
            method: 'POST',
            headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
            body: JSON.stringify(
                {
                    availInfo: JSON.stringify({ ItemId: selectedItem ? selectedItem.id : 5, Type: 'service', Date: moment(selectedDate).format('yyyy-MM-DD'), Minutes: selectedTime, ItemName: selectedItem.officialName, VerifyToken : captchaToken }),
                    customerInfo: JSON.stringify({
                        firstName: formValues["customer_first-name"],
                        lastName: formValues["customer_last-name"],
                        email: formValues["customer_email"],
                        mobilePhoneNumber: formValues["customer_phone"],
                        notifyByEmail: formValues["email-checkbox"],
                        notifyByText: formValues["phone-checkbox"],
                        optInTextMarketing: formValues["text_marketing"],
                        optInEmailMarketing: formValues["email_newsletter"],
                        isFirstTimeCustomer: formValues["firs_visit"],
                        creditCardDetail: {
                            nonce: cardNonce,
                            billingAddressPostalCode: billingPostalCode,
                            cardholderName: formValues["customer_first-name"] + " " + formValues["customer_last-name"] //TODO: Добавить поле в верстку
                        }
                    })
                })
        });

       return await rawResponse.json();
    };

    return (
        <div className="customer-container">
            <div className="customer-name">
                <div className="customer-firstname">
                    <p className="customer-info_title">First Name</p>
                    <input id="customer_first-name" type="text" onChange={handleChangeFormValues} onBlur={() => handleOnBlurInput('customer_first-name')}/>
                    <span className="validation-error">{!formValidation["customer_first-name"] && "First name is required"}</span>
                </div>
                <div className="customer-lastname">
                    <p className="customer-info_title">Last Name</p>
                    <input id="customer_last-name" type="text" onChange={handleChangeFormValues} onBlur={() => handleOnBlurInput('customer_last-name')}/>
                    <span className="validation-error">{!formValidation["customer_last-name"] && "Last name is required"}</span>
                </div>
            </div>

            <div className="customer-contact-info">
                <h1>CONTACT INFORMATION</h1>
                <div className="customer-checkboxes">
                    <p className="customer-info_title">Preferred Contact Method</p>
                    <input type="checkbox" id="email-checkbox" name="email" onChange={handleChangeFormValues}/>
                    <label htmlFor="email">Email</label>
                    <input type="checkbox" id="phone-checkbox" name="text" onChange={handleChangeFormValues}/>
                    <label htmlFor="text">Text</label>
                    <input type="checkbox" id="both-checkbox" name="both" onChange={handleChangeFormValues}/>
                    <label htmlFor="to">Both</label>
                    <span className="validation-error" >{(!formValidation['email-checkbox'] && !formValidation['phone-checkbox'])  && "Please select one of the contact methods"}</span>
                </div>
                <div className="customer-info-inputs">
                    <div className="customer-email">
                        <p className="customer-email_title">Email</p>
                        <input id="customer_email" type="text" onChange={handleChangeFormValues} onBlur={() => handleOnBlurInput('customer_email')}/>
                        <span className="validation-error" >{!formValidation['customer_email'] && "Please, enter valid email"}</span>
                    </div>
                    <div className="customer-phone">
                        <p className="customer-phone_title">Mobile</p>
                        <input id="customer_phone" type="text" onChange={handleChangeFormValues} onBlur={() => handleOnBlurInput('customer_phone')}/>
                        <span className="validation-error" >{!formValidation['customer_phone'] && "Please, enter valid phone"}</span>
                    </div>
                </div>
            </div>

            <div className="customer-appointments-details">
                <h1>APPOINTMENT DETAILS</h1>
                <div className="appointments-details_info">
                    {moment(selectedDate).format('dddd, MMMM DD, yyyy') + " " + getTimeByMinutes(selectedTime) + " EST: " + selectedItem.displayName}
                </div>
            </div>

            <div className="customer-credit-card-info">
                <h1>ENTER CREDIT CARD INFORMATION TO HOLD APPOINTMENT</h1>
                {isLoad ? <div id="form-container">
                    <div id="sq-card-number"/>
                    <div className="third" id="sq-expiration-date"/>
                    <div className="third" id="sq-cvv"/>
                    <div className="third" id="sq-postal-code"/>
                    <div className="third" id="sq-card-holder" placeholder="Cardholder Name"/>
                </div> : "Loading credit card processor..."}

            </div>


            <div className="customer-policy">
                <h1>CANCELLATION AND NO SHOW POLICY</h1>
                <p className="policy-info">You may cancel up to 24 hours before your appointment by calling us at
                    212-758-1065. By entering your credit card information, you agree to accept a $20 cancellation fee
                    if you do not cancel 24 hours ahead of time or do not show up</p>

                <input type="checkbox" id="policy_checkbox" name="policy_checkbox"/>
                <label htmlFor="policy_checkbox">Yes, I understand this policy *</label>
            </div>

            <div className="customer-offers">
                <h1>BE THE FIRST TO KNOW ABOUT NEW PRODUCTS, SALES AND EXCLUSIVE OFFERS!</h1>

                <input type="checkbox" id="email_newsletter" name="newsletter" onChange={handleChangeFormValues}/>
                <label htmlFor="newsletter">Yes, sign me up for the Email Newsletter</label>
                <input type="checkbox" id="text_marketing" name="signup_marketing" onChange={handleChangeFormValues}/>
                <label htmlFor="signup_marketing">Yes, sign me up for Marketing Text Messages</label>
                <input type="checkbox" id="firs_visit" name="firs_visit" onChange={handleChangeFormValues}/>
                <label htmlFor="firs_visit">This is my first visit to the salon.</label>
            </div>

            <div id="last-step_error" className="last-step_error">{lastStepError}</div>

            {
                isLoad &&
				<>
					<button className="back-btn" onClick={() => step == 3 ? handleChangeStep(2) : handleChangeStep(1)}>Back</button>
					<button className="next-btn" onClick={() => step == 2 ? handleChangeStep(3) : handleChangeStep(4)}>{step == 2 ? `Next` : `Confirm`}</button>
					<ReCAPTCHA ref={recaptchaRef} size="invisible" sitekey={reCaptchaKey}/>
				</>
            }
            <div id="card-nonce" className="card-nonce" />
            {/*{isLoad && <button id="sq-creditcard" onClick={() => paymentForm.requestCardNonce()} className="button-credit-card"> Pay £ 1.00</button>}*/}
        </div>
    )
}

export default CustomerInfo;
