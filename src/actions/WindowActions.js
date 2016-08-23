import * as types from '../constants/ActionTypes'
import axios from 'axios';
import config from '../config';

export function createWindow(windowType, docId = "NEW"){
    return (dispatch) => {
        // this chain is really important,
        // to do not re-render widgets on init
        dispatch(patchRequest(windowType, docId)).then((response)=>{
            dispatch(initDataSuccess(nullToEmptyStrings(response.data[0].fields)));
            dispatch(initLayout(windowType)).then((response) => {
                dispatch(initLayoutSuccess(response.data))
            });
        });
    }
}

function nullToEmptyStrings(arr){
    return arr.map(item =>
        (item.value === null) ?
        Object.assign({}, item, { value: "" }) :
        item
    )
}

export function initLayout(windowType){
    return dispatch => axios.get(config.API_URL + '/window/layout?type=' + windowType);
}

export function initData(windowType, id) {
    return dispatch => axios.get(config.API_URL + '/window/data?type=' + windowType + '&id=' + id);
}

export function initLayoutSuccess(layout) {
    return {
        type: types.INIT_LAYOUT_SUCCESS,
        layout: layout
    }
}
export function initDataSuccess(data) {
    return {
        type: types.INIT_DATA_SUCCESS,
        data: data
    }
}
export function updateDataSuccess(item) {
    return {
        type: types.UPDATE_DATA_SUCCESS,
        item: item
    }
}

/*
*  Wrapper for patch request of widget elements
*  when responses should merge store
*/
export function patch(windowType, id = "NEW", property, value) {
    return dispatch => {
        dispatch(patchRequest(windowType, id, property, value)).then(response => {
            response.data[0].fields.map(item => {
                dispatch(updateDataSuccess(item));
            })
        })
    }
}

export function patchRequest(windowType, id = "NEW", property, value) {
    let payload = {};

    if(id === "NEW"){
        payload = [];
    }else{
        payload = [{
            'op': 'replace',
            'path': property,
            'value': value
        }];
    }

    return dispatch => axios.patch(config.API_URL + '/window/commit?type=' + windowType + '&id=' + id, payload);
}

export function updateDataProperty(property, value){
    return {
        type: types.UPDATE_DATA_PROPERTY,
        property: property,
        value: value
    }
}
