import React, {useCallback, useEffect, useState} from "react";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import "./styles.css";
import moment from "moment";

function GiftCard() {
    const [selectedDate, setSelectedDate] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [senderName, setSenderName] = useState(null);
    const [senderEmail, setSenderEmail] = useState(null);
    const [recipientName, setRecipientName] = useState(null);
    const [recipientEmail, setRecipientEmail] = useState(null);
    const [messageText, setMessageText] = useState(null);
    const [cardAmount, setCardAmount] = useState(0);
    const [giftCardId, setGiftCardId] = useState(-1);
    const [giftCardVariantId, setGiftCardVariantId] = useState(-1);

    useEffect(() => {
        const initSession = async () => {
            const rawResponse = await fetch('https://erpapi.mariobadescu.com/api/erp/rise/SessionId', {
                method: 'GET',
                headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
            });
            let response = await rawResponse.json();
            if (response)
                setSessionId(response.result.id)
        }
        initSession().catch(err => console.log("Gift Card Session Init Error", err));
    }, []);


    const createGiftCard = async () => {
        const rawResponse = await fetch('https://erpapi.mariobadescu.com/api/erp/rise/CreateGift/' + sessionId, {
            method: 'POST',
            headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
            body: JSON.stringify({
                "gift": {
                    "value": Number(cardAmount),
                    "name": recipientName,
                    "email": recipientEmail,
                    "message": messageText,
                    "sending_method": "email",
                    "send_at": moment(selectedDate).format('YYYY-MM-DDTHH:MM:mm:SSS')
                }
            })
        });
        let response = await rawResponse.json();
        if(response.result.gift)
            setGiftCardId(response.result.gift.id);

        await addGiftToCart(response.result.gift.id).catch(err => console.log("Gift Cart Add to Cart Error ", err));

        console.log(response.result.gift.id);
    }

    const addGiftToCart = async (cardId: number) => {
        const rawResponse = await fetch('/cart/add.js', {
            method: 'POST',
            headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
            body: JSON.stringify({
                items: [
                    {
                        quantity: 1,
                        id: Number(giftCardVariantId),
                        properties: {
                            _id: cardId,
                            amount: Number(cardAmount),
                            session_id: sessionId,
                        },
                    }
                ]
            })
        });
        let result = await rawResponse.json();
        if(result.items){
            console.log('Added to cart', result);
        }

    }

    const handleAmountChange = (e) => {
        setCardAmount(e.target.options[e.target.selectedIndex].value);
        setGiftCardVariantId(e.target.options[e.target.selectedIndex].id);
    }


    const handleAddToCart = () => {
        if (sessionId.length <= 0)
            console.log("SessionId is empty");

        if (cardAmount > 0 && senderName.length > 0 && senderEmail.length > 0 && recipientEmail.length > 0 && recipientName.length > 0) {
            createGiftCard().catch(err => console.log("Gift Cart Creation Error ", err));
        } else
            console.log("One of required field is empty")
    }

    return (
        <div className="giftcard-wrapper">
            <div className="giftcard-type-wrapper">
                <h2>E-CARD</h2>
                <p>Select an amount between $25-$500 USD</p>
                <select className="amount-selector" onChange={handleAmountChange}>
                    <option value="none">Select amount</option>
                    <option id="42578456117397" value="10">$10</option>
                    <option id="42578456150165" value="25">$25</option>
                    <option id="43054322843875" value="50">$50</option>
                    <option id="42578456215701" value="100">$100</option>
                </select>
            </div>
            <div className="send-form">
                <div className="left-side">
                    <h2>From</h2>
                    <input id="sender-name" type="text" onChange={e => setSenderName(e.target.value)} placeholder="Sender's Name *"/>
                    <input id="sender-email" type="email" onChange={e => setSenderEmail(e.target.value)} placeholder="Sender's email *"/>
                    <h2>To</h2>
                    <input id="recipient-name" type="text" onChange={e => setRecipientName(e.target.value)} placeholder="Recipient's Name *"/>
                    <input id="recipient-email" type="email" onChange={e => setRecipientEmail(e.target.value)} placeholder="Recipient's email *"/>
                </div>
                <div className="right-side">
                    <h2>Message</h2>
                    <textarea id="message-text" maxLength={200} onChange={e => setMessageText(e.target.value)} placeholder="Add your message here..."/>
                    <h2>Deliver on</h2>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        minDate={new Date()}
                        showDisabledMonthNavigation
                    />
                    <span>Note: Leave this field blank to send it out today</span>
                </div>
            </div>
            <br/>
            <button id="add-to-cart" onClick={handleAddToCart}>Add to cart</button>
        </div>
    );
}

export default GiftCard;
