import {PageManager} from "./page-manager.js";

export function invertColors() {
    const rootStyles = getComputedStyle(document.documentElement);
    const variableNames = [
        '--primary-color',
        '--primary-darker-color',
        '--secondary-color',
        '--secondary-darker-color',
        '--tertiary-color',
        '--tertiary-darker-color',
        '--accent-color',
        '--accent-darker-color',
        '--background-color',
        '--background-secondary-color'
    ];
    variableNames.forEach((variable) => {
        document.documentElement.style.setProperty(variable, invertColor(rootStyles.getPropertyValue(variable)));
    });
}

export function invertColor(hex) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    // invert color components
    var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
        g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
        b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
    // pad each with zeros and return
    return '#' + padZero(r) + padZero(g) + padZero(b);
}

export function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}


export function logout() {
    fetch('/api/auth/logout/', {method: 'POST'})
        .then(response => {
            if (response.status !== 200) {
                throw new Error("Logout failed");
            }
            deleteCookie('Authorization');
            sessionStorage.removeItem('refresh_token');
            sessionStorage.removeItem('access_token');
        })
        .catch((error) => {
            alert(error);
        });
    PageManager.getInstance().load('auth/login')
}

function setCookie(name, value, attributes) {
    let cookie = `${name}=${value};`;
    Object.keys(attributes).forEach((key) => {
        cookie += typeof attributes[key] === 'boolean' ? `${key};` : `${key}=${attributes[key]}; `;
    });
    document.cookie = cookie;
}

function deleteCookie(name) {
    document.cookie = `${name}=; Max-Age=-99999999;`;
}

function refreshToken() {
    let refresh_token = sessionStorage.getItem('refresh_token');
    fetch('/api/auth/refresh/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({refresh_token: refresh_token}),
    })
        .then(response => {
            if (response.status !== 200) {
                throw new Error("Refresh failed");
            }
            return response.json();
        })
        .then(data => {
            saveToken(data);
        })
        .catch((error) => {
            alert(error);
        });
}

export function saveToken(data) {
    setCookie('Authorization', `${data.access_token}`, { path: '/', expires: new Date(data.access_expiration * 1000), SameSite: 'None', Secure: true});
    setCookie('refresh_token', data.refresh_token, { path: '/', expires: new Date(data.refresh_expiration * 1000), SameSite: 'None', Secure: true});
    setTimeout(() => refreshToken(), (data.access_expiration * 1000 - Date.now()) - 1000); // Refresh token 1 second before expiration
}
