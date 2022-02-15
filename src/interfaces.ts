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
    avatar: string;
    about: string;
    creation: number;
    type: string;
    owner: string;
    verified: boolean;
    verificator: string;
    otp: string;
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
    tfa?: boolean;
};

export interface Member {
    id: string;
    username: string;
    discriminator: string;
    avatar: string;
    about: string;
    nickname?: string;
    roles: string[];
};

export interface Role {
    id: string,
    name: string;
    permissions: number;
    color: string | null;
    hoist: boolean;
};

export interface Author {
    id: string;
    username: string;
    nickname?: string;
    discriminator: string;
    avatar: string;
    about: string;
    type: string;
};

export interface Message {
    id: string;
    author: string | Author;
    content: string;
    attachment?: string;
    attachmentId?: string;
    creation: number;
    edited: number;
    type: string;
};

export interface ChannelRole {
    id: string,
    permissions: number;
};

export interface Webhook {
    token: string;
    username: string;
}

export interface Channel {
    id: string;
    name: string;
    topic: string | null;
    creation: number;
    roles: ChannelRole[];
    webhooks: Webhook[];
    messages?: Message[];
    pins?: string[];
};

export interface Invite {
    code: string;
    author: string | Author;
    expiration: number;
    maxUses: number;
    uses: number;
}

export interface Guild {
    id: string;
    name: string,
    description: string | null,
    public: boolean,
    channels?: Channel[],
    roles: Role[],
    members?: Member[] | number,
    bans?: string[];
    invites?: Invite[];
};

export interface FileI {
    id: string;
    url: string;
    type: string;
}; 