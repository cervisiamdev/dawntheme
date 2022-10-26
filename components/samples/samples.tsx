import React, {useCallback, useEffect, useRef, useState} from "react";

import "./styles.css";
import SamplesProductCard from "./Card/samplesProductCard";

//TODO: REMOVE
function Samples() {
    const [samplesData, setSamplesData] = useState([]);
    const [allSamplesData, setAllSamplesData] = useState([]);
    const [sampleProductIds, setSampleProductIds] = useState<Array<number>>([]);

    const updateCartAttributes = useCallback(async () => {
        const rawResponse = await fetch('/cart/update.js', {
            method: 'POST',
            headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
            body: JSON.stringify({
                attributes: {
                    'sample_productIds': sampleProductIds.map(x => x).join(',')
                }
            })
        });
        let result = await rawResponse.json();

        // console.log(result);
    }, [sampleProductIds]);


    const onHandleSetProductIds = (productId: number) => {
        if(sampleProductIds.includes(productId)){

            setSampleProductIds([...sampleProductIds.filter(id => id != productId)]);
        } else {

            setSampleProductIds([...sampleProductIds, productId]);
        }
    }

    const onHandleSortChanged = (e) => {
        let sortValue = e.target.options[e.target.selectedIndex].text;
        if(sortValue === 'All Products')
            setSamplesData(allSamplesData);
        else
            setSamplesData(allSamplesData.filter(x => x.product_category === sortValue));

        console.log('SORT ORDER', sortValue);
        console.log('SORT ORDER SAMPLES DATA', samplesData);
    }

    useEffect(() => {
        // console.log('sampleProductIds', sampleProductIds);
        updateCartAttributes().catch(err => console.log("Update Cart Attributes Error", err));
    }, [sampleProductIds]);

    useEffect(() => {
        const getCartSamples  = async () => {
            const rawResponse = await fetch('/cart.js', {
                method: 'GET',
                headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
            });
            let result = await rawResponse.json();

            if(result.attributes.sample_productIds && result.attributes.sample_productIds.length > 0) {
                if(result.attributes.sample_productIds.indexOf(',') != -1)
                {
                    let samplesIds = result.attributes.sample_productIds.split(',');
                    setSampleProductIds([...sampleProductIds, ...samplesIds]);
                } else {
                    setSampleProductIds([...sampleProductIds, result.attributes.sample_productIds]);
                }
            }

            let jsonData = JSON.parse(document.getElementById('hidden-variant-metafields-container').innerText);
            setSamplesData(jsonData);
            setAllSamplesData(jsonData);
        }
        getCartSamples().catch(err => console.log("Get Cart Samples Error", err));



    }, []);

    return (
        sampleProductIds && sampleProductIds.length >= 0 &&
        <div className="sample-content">
            <h1>SELECT SAMPLES</h1>
            <div className="samples-body">
                <select className="selector-category" onChange={onHandleSortChanged}>
                        <option value="best_sellers" >Best-Sellers</option>
                        <option value="bath_body" >Bath & Body</option>
                        <option value="acne_products" >Acne Products</option>
                        <option value="combination_skin">Combination Skin</option>
                        <option value="sensitive_skin">Sensitive Skin</option>
                        <option value="oily_skin">Oily Skin</option>
                        <option value="dry_skin">Dry Skin</option>
                        <option value="all_products">All Products</option>
                </select>
                 {
                     samplesData && samplesData.map(sample =>
                        {
                            let isIncludeId = sampleProductIds.includes(sample.product_id);
                            console.log('IS INCLUDED', isIncludeId);
                            return <SamplesProductCard key={sample.product_id}
                                                       id={sample.product_id}
                                                       imageUrl={sample.sampleimage}
                                                       name={sample.product_title}
                                                       buttonTitle={isIncludeId ? 'Remove' : 'Add'}
                                                       category={sample.product_category}
                                                       buttonOnClickAction={onHandleSetProductIds}
                                                       />
                            // setButtonTitleFunc={(setButtonTitle) => setButtonTitle(isIncludeId ? 'Remove' : 'Add') }
                        }

                    )
                }
            </div>
        </div>
    )
}

export default Samples;
