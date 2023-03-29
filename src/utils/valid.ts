export const nameValid = (name: string) => {
    const name_pattern = /^[a-zA-Z0-9_]{3,16}$/;

    return name.match(name_pattern) !== null
};

export const passwordValid = (password: string) => {
    const password_pattern = /^[a-zA-Z0-9_]{6,16}$/

    return password.match(password_pattern) !== null
}