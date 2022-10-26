import React, {useCallback, useEffect, useState} from "react";

interface IProps {
    id: number,
    imageUrl: string,
    name: string,
    category: string,
    buttonTitle: string,
    buttonOnClickAction: Function,
}

function SamplesProductCard(props: IProps) {
    const {id, imageUrl, name, buttonOnClickAction, buttonTitle} = props;

    return (
        <div id={id.toString()} className="samples-product-card">
            <img src={imageUrl} alt="Sample"/>
            <p className="samples-product-name">{name}</p>
            <button className="samples-product-button-add" onClick={() => {
                buttonOnClickAction(id);
            }}>{buttonTitle}</button>
        </div>
    )
}

export default SamplesProductCard;
