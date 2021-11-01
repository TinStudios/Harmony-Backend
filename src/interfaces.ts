export interface Info {
    id: string;
}

export interface User {
    id: string;
    token: string;
    email: string;
    password: string;
    username: string;
    discriminator: string;
    creation: number;
<<<<<<< HEAD
    verified: boolean;
    verificator: string;
    otp: string;
=======
>>>>>>> 0718f96 (Changed to TypeScript)
};

export interface Friend {
    id: string;
    blocked: boolean;
}

export interface ReturnedUser {
    id: string;
    username: string;
    discriminator: string;
    creation: number;
<<<<<<< HEAD
    tfa: boolean;
=======
>>>>>>> 0718f96 (Changed to TypeScript)
};

export interface Member {
    id: string;
    username: string;
    discriminator: string;
    nickname?: string;
    roles: string[];
};

export interface Role {
    id: string,
    name: string;
    permissions: number;
    color?: string;
    hoist: boolean;
};

export interface Author {
    id: string;
    username: string;
    nickname?: string;
    discriminator: string;
};

export interface Message {
    id: string;
    author: string | Author;
    content: string;
<<<<<<< HEAD
    attachment?: string;
=======
>>>>>>> 0718f96 (Changed to TypeScript)
    creation: number;
};

export interface Channel {
    id: string;
    name: string;
    topic?: string;
    creation: number;
    roles: Role[];
    messages: Message[];
    pins: string[];
};

<<<<<<< HEAD
export interface Invite {
    code: string;
    author: string | Author;
    expiration: number;
    maxUses: number;
    uses: number;
}

=======
>>>>>>> 0718f96 (Changed to TypeScript)
export interface Guild {
    id: string;
    name: string,
    description?: string,
    public: boolean,
    channels: Channel[],
    roles: Role[],
    members: Member[],
    bans: string[];
<<<<<<< HEAD
    invites: Invite[];
};

export interface FileI {
    id: string;
    url: string;
    type: string;
}; 
=======
};
>>>>>>> 0718f96 (Changed to TypeScript)
