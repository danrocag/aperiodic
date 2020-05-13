import $ from 'jquery';

export interface Settings {
    L: number,
}

export function extractSettings() : Settings | null {
    let value = $("#L").val();
    if (typeof value === "number"){
        return {L: value}
    } else {
        return null
    }
}