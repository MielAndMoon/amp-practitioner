const doPostRequest = async (url, data, csrftoken) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    return result;
}

export { doPostRequest }