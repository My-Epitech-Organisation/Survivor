import { NextResponse, NextRequest } from 'next/server';
import api from "@/lib/api"
import { RouteRoles } from '@/types/route';
import { Roles } from '@/types/role';
import { User } from './types/user';

async function isValidToken(token: string | null) : Promise<User | null>{
    if (!token) {
        return null;
    }
    try {
        return (await api.get<User>('/user', token)).data;
    } catch (error) {
        console.error('Token validation error:', error);
        return null;
    }
    return null;
}

const Protectedroutes: RouteRoles [] = [
    {
        route: "/admin",
        rolesAuth: ["admin"]
    },
    {
        route: "/startup",
        rolesAuth: ["founder"]
    },
]

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    let isPrivatePath: boolean = false;

    Protectedroutes.map((pRoute) => {
        isPrivatePath = isPrivatePath || path.startsWith(pRoute.route)
    })
    if (!isPrivatePath) {
        return NextResponse.next();
    }

    const token = request.cookies.get('authToken')?.value || null;

    const user = await isValidToken(token);

    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const matchedRoute = Protectedroutes.find(pRoute => path.startsWith(pRoute.route));

    if (matchedRoute) {
        const userRole = user.role;
        const isAuthorized = matchedRoute.rolesAuth?.includes(userRole);
        if (!isAuthorized) {
            console.info("UnAuthorized: " + userRole);
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/projects/:path*',
        '/admin/:path*',
        '/startup/:path*',
    ],
};
