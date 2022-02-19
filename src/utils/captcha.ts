import got from 'got-cjs';

export default async (secret: string, response: string): Promise<boolean> => {
    return ((await got.post('https://www.google.com/recaptcha/api/siteverify', {
        searchParams: {
            secret: secret,
            response: response
        }
    }).json()) as any).success;
};