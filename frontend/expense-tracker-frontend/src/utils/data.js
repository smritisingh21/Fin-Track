import {
    LuLayoutDashboard,
    LuHandCoins,
    LuWalletMinimal,
    LuLogOut
} from "react-icons/lu"

export const SIDE_DATA_MENU =[


    {
        id: "01",
        label:"Dashboard",
        icon:LuLayoutDashboard,
        path: "/dashboard"

    },
    {
        id: "02",
        label:"Income",
        icon:LuHandCoins,
        path: "/income"

    },
    {
        id: "03",
        label:"Expenses",
        icon:LuWalletMinimal,
        path: "/expenses"

    },
    {
        id: "04",
        label:"Logout",
        icon:LuLogOut,
        path: "/logout"

    },
]

