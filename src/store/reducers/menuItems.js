// third-party
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {mainAppName} from "../../consts";
import {appRoles} from "../../config";
// project imports
export const fetchMenuItems = createAsyncThunk(
    'menuItems/fetchMenuItems',
    async (user, option) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        let menuObject;
        if (user?.appRoles?.length > 0) {
            menuObject = [
                {
                    id: 'bot-builder-main-page',
                    type: 'group',
                    children: [
                        {
                            id: 'builder-widget',
                            title: mainAppName + " Wizard",
                            type: 'item',
                            url: '/bot/wizard',
                            icon: 'PrecisionManufacturingOutlined',
                            chip: {
                                label: 'new',
                                color: 'primary',
                                size: 'small',
                                variant: 'combined'
                            }
                        }
                    ]
                },
                // {
                //   id: 'chat-widget-main-page',
                //   type: 'group',
                //   children: [
                //     {
                //       id: 'chat-widget',
                //       title: 'AppGPT Chat',
                //       type: 'item',
                //       icon: 'SmsOutlined',
                //       url: '/apps/chat-widget',
                //     }
                //   ]
                // }
                {
                    id: 'model-upgrade-page',
                    type: 'group',
                    children: [
                        {
                            id: 'model-upgrade',
                            title: 'Model Upgrade',
                            type: 'item',
                            icon: 'UpgradeOutlined',
                            url: '/bot/model-upgrade',
                        }
                    ]
                },
                {
                    id: 'all-chatBot-agents-page',
                    type: 'group',
                    children: [
                        {
                            id: 'all-chatBot-agents',
                            title: 'GPT Console',
                            type: 'item',
                            icon: 'MessageOutlined',
                            url: '/bot/all-chatbot-agents'
                        }
                    ]
                }
            ]
        } else {
            //need to add functionality
        }
        if (user?.appRoles?.includes(appRoles["masterAdminRole"]) || user?.appRoles?.includes(appRoles["superAdminRole"]) || user?.appRoles?.includes(appRoles["adminRole"])) {
            menuObject.splice(1, 0, {
                id: 'multi-agent-page',
                type: 'group',
                children: [
                    {
                        id: 'multi-agent',
                        title: 'Multi Agent',
                        type: 'item',
                        icon: 'SmartToyOutlined',
                        url: '/bot/multi-agent',
                    }
                ]
            },)
            menuObject.push(
                {
                    id: 'dashboard-page-1',
                    type: 'group',
                    children: [{
                        id: 'dashboard-01',
                        title: 'Admin Console',
                        target: "_blank",
                        type: 'item',
                        icon: 'Dashboard',
                        url: '/admin',
                    }]
                })
        }
        return menuObject;
    }
);

export const fetchAdminMenuItems = createAsyncThunk(
    'menuItems/fetchAdminMenuItems',
    async (user, option) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        let menuObject;
        if (user?.appRoles?.length > 0) {
            menuObject = [
                {
                    id: 'dashboard-page-1',
                    type: 'admin',
                    children: [
                        {
                            id: 'dashboard-01',
                            title: 'Dashboard',
                            type: 'item',
                            icon: 'Dashboard',
                            url: '/admin',
                        }
                    ]
                },
                {
                    id: 'multi-agent-page',
                    type: 'admin',
                    children: [
                        {
                            id: 'multi-agent',
                            title: 'Multi Agent',
                            type: 'item',
                            icon: 'SmartToyOutlined',
                            url: '/admin/multi-agent',
                        }
                    ]
                },
                {
                    id: 'model-upgrade-page',
                    type: 'admin',
                    children: [
                        {
                            id: 'model-upgrade',
                            title: 'Model Upgrade',
                            type: 'item',
                            icon: 'UpgradeOutlined',
                            url: '/admin/model-upgrade',
                        }
                    ]
                },
                {
                    id: 'guard-rails-page',
                    type: 'admin',
                    children: [
                        {
                            id: 'guard-rail',
                            title: 'Guard Rail',
                            type: 'item',
                            icon: 'ShieldOutlined',
                            url: '/admin/guard-rail'
                        }
                    ]
                },
                {
                    id: 'base-models-page',
                    type: 'admin',
                    children: [
                        {
                            id: 'base-models',
                            title: 'Foundation Models',
                            type: 'item',
                            icon: 'Foundation',
                            url: '/admin/base-models'
                        }
                    ]
                },
                {
                    id: 'user-management-page',
                    type: 'admin',
                    children: [
                        {
                            id: 'user-management',
                            title: 'User Management',
                            type: 'item',
                            icon: 'PersonAddAlt1Outlined',
                            url: '/admin/user-management'
                        }
                    ]
                }
            ]
        } else {
            //need to add functionality
        }
        if (user?.appRoles?.includes(appRoles["userRole"]) || user?.appRoles?.includes(appRoles["adminRole"]) || user?.appRoles?.includes(appRoles["superAdminRole"])) {
            menuObject.push({
                id: 'contact-support-page',
                type: 'admin-b',
                children: [
                    {
                        id: 'contact-support',
                        title: 'Contact Support',
                        type: 'item',
                        icon: 'SupportAgentOutlined',
                        url: '/admin/contact-support'
                    }
                ]
            })
        }
        return menuObject;
    }
);

export const fetchBotsMenuItems = createAsyncThunk(
    'menuItems/fetchBotsMenuItems',
    async (user, option) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        let menuObject;
        const customNavList = []
        const dynamicCustomNavItems = (items) => {
            items?.map((ele, i) => {
                let object = {
                    id: ele?.interpreterId,
                    name: ele?.botName,
                    type: 'item',
                    customNav: true,
                    profileURL: ele?.profileURL || "",
                    status: ele?.status || ""
                }
                customNavList.push(object)
            })
            return customNavList;
        }

        if (user?.customNavItems?.length > 0) {
            dynamicCustomNavItems(user?.customNavItems)
        } else if (user?.customNavItems?.length === 0 && user?.notBotsFound) {
            return [];
        }

        if (user?.appRoles?.length > 0) {
            menuObject = customNavList
        } else {
            //need to add functionality
        }
        return menuObject;
    }
);

const initialState = {
    error: null,
    items: [],
    adminItems: [],
    selectedOption: null,
    status: 'idle',
    loading: true,
    isListFetching: true
};

const slice = createSlice({
    name: 'menuItems',
    initialState,
    reducers: {
        selectOption: (state, action) => {
            state.selectedOption = action.payload;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMenuItems.pending, (state) => {
                state.status = 'loading';
                state.loading = true
            })
            .addCase(fetchMenuItems.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchMenuItems.rejected, (state, action) => {
                state.status = 'failed';
                state.loading = false
                state.error = action.error.message;
            }).addCase(fetchAdminMenuItems.pending, (state) => {
            state.status = 'loading';
            state.loading = true
        }).addCase(fetchAdminMenuItems.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.loading = false;
            state.adminItems = action.payload;
        }).addCase(fetchAdminMenuItems.rejected, (state, action) => {
            state.status = 'failed';
            state.loading = false
            state.error = action.error.message;
        }).addCase(fetchBotsMenuItems.pending, (state) => {
            state.isListFetching = true
        }).addCase(fetchBotsMenuItems.fulfilled, (state, action) => {
            state.isListFetching = false;
            state.items = action.payload;
        })
            .addCase(fetchBotsMenuItems.rejected, (state, action) => {
                state.isListFetching = false;
                state.error = action.error.message;
            });
    }
});

export const {selectOption} = slice.actions;

export default slice.reducer;


