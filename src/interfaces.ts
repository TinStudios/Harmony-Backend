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
<<<<<<< HEAD
    verified: boolean;
    verificator: string;
    otp: string;
=======
>>>>>>> 0718f96 (Changed to TypeScript)
=======
    verified: boolean;
    verificator: string;
>>>>>>> f899d83 (Some changes (like adding email verification))
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
    id: string;
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
<<<<<<< HEAD
    attachment?: string;
=======
>>>>>>> 0718f96 (Changed to TypeScript)
=======
    attachment?: string;
>>>>>>> 332c1ca (owo)
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
<<<<<<< HEAD
=======
>>>>>>> 51556ba (Some changes)
export interface Invite {
    code: string;
    author: string | Author;
    expiration: number;
    maxUses: number;
    uses: number;
}

<<<<<<< HEAD
=======
>>>>>>> 0718f96 (Changed to TypeScript)
=======
>>>>>>> 51556ba (Some changes)
export interface Guild {
    id: string;
    name: string;
    description?: string;
    public: boolean;
    channels: Channel[];
    roles: Role[];
    members: Member[];
    bans: string[];
<<<<<<< HEAD
<<<<<<< HEAD
    invites: Invite[];
};

export interface FileI {
    id: string;
    url: string;
    type: string;
<<<<<<< HEAD
}; 
=======
};
>>>>>>> 0718f96 (Changed to TypeScript)
=======
    invites: Invite[];
};
>>>>>>> 51556ba (Some changes)
=======
};
>>>>>>> 1d14aba (new storage...  aaaaaa 🥲)
