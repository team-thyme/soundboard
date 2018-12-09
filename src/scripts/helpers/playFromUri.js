function getPathArguments() {
    // Ensure baseuri is pointing to a directory
    let path = window.location.href.substr(document.baseURI.length);

    while (path.endsWith('/')) {
        path = path.substr(0, path.length - 1);
    }

    return path.split('/');
}

/**
 * Plays samples supplied by URL path, if supplied.
 */
export default async function playFromUri(sampleContainer) {
    const pathArguments = getPathArguments();

    for (let i = 0; i < pathArguments.length; i++) {
        await sampleContainer.playRandomWithId(
            pathArguments[i],
            true,
            false,
            true
        );
    }
}
