import {lazy} from 'react';

// project import
import MainLayout from 'layout/MainLayout';
import CommonLayout from 'layout/CommonLayout';
import Loadable from 'components/Loadable';
import AuthGuard from 'utils/route-guard/AuthGuard';
import BotBuilder from '../components/BotBuilder/BotBuilder';
import MemoryDialog from '../components/MemoryDialog/MemoryDialog';
import HomePageMain from '../pages/home-page/home-page-main';
import PrivacyPolicyPage from "../pages/privacy-policy/privacyPolicy";
import TermsConditionsPage from "../pages/terms-conditions/termsConditions";
import GoogleAuthorization from "../pages/google-authorization/GoogleAuthorization";
import MultiAgent from '../pages/multi-agent/MultiAgent';
import GuardRail from '../pages/guard-rail/GuardRail';
import AdminDashboard from '../pages/AdminDashboard/AdminDashboard';
import BaseModels from '../pages/BaseModels/BaseModels';
import UserManagement from "../pages/UserManagement/UserManagement";
import FlowChart from "../components/Reactflow/Reactflow";
import ReactFlowWrapper from "../components/Reactflow/ReactUndoRedo";
import GuardRailActionComponent from '../components/DemoComponents/GuardRailActionComponent';
import AuthVerifier from "../components/AuthVerifier/AuthVerifier";
import ContactSupport from '../pages/contact-support/ContactSupport';


// render - applications
const ChatWidget = Loadable(lazy(() => import('pages/apps/chat-widget')));
const AllBotsChatWidget = Loadable(lazy(() => import("../pages/all-bots-chat-widget/index")));
const ChatBotAgentsContainer = Loadable(lazy(() => import("../pages/chat-bot-agents/index")));
const ModelUpgrade = Loadable(lazy(() => import("../pages/ModelUpgrade/ModelUpgrade")))

const UserProfile = Loadable(lazy(() => import('pages/apps/profiles/user')));
const UserTabPersonal = Loadable(lazy(() => import('sections/apps/profiles/user/TabPersonal')));


// render - forms & tables
const BotCreateWizard = Loadable(lazy(() => import('sections/bot/wizard/create-wizard')));
// pages routing
const AuthRegister = Loadable(lazy(() => import('pages/auth/register')));

const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/404')));
const MaintenanceError500 = Loadable(lazy(() => import('pages/maintenance/500')));
const MaintenanceUnderConstruction = Loadable(lazy(() => import('pages/maintenance/under-construction')));
const MaintenanceComingSoon = Loadable(lazy(() => import('pages/maintenance/coming-soon')));
const JsonEditor = Loadable(lazy(() => import('../components/JsonEditor/renderJsonEditor')));
const ErrorPage = Loadable(lazy(() => import('../components/ErrorPage/ErrorPage')));
const CustomErrorPage = Loadable(lazy(() => import('../components/ErrorPage/CustomErrorPage')));
const PricingPage = Loadable(lazy(() => import('../components/Pricing/Pricing')));


// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <CommonLayout/>,
      children: [
        {path: '', element: <AuthVerifier/>}
      ]
    },
    {
      path: 'json-editor',
      element: <JsonEditor/>
    },
    {
      path: 'google-authorization',
      element:<GoogleAuthorization/>
    },
    {
      path: "access-denied",
      element: (
        <AuthGuard>
          <ErrorPage/>
        </AuthGuard>
      )
    },
    {
      path: "error-page",
      element: (
        <AuthGuard>
          <CustomErrorPage/>
        </AuthGuard>
      )
    },
    {
      path: "pricing",
      element:  <PricingPage/>
    },
    {
      path: '/',
      element: (
        <AuthGuard>
          <MainLayout/>
        </AuthGuard>
      ),
      children: [
        {
          path: 'bot',
          children: [
            {
              path: 'wizard',
              element: <BotCreateWizard/>
            },{
              path: 'model-upgrade',
              element: <ModelUpgrade/>
            },
            {path: "universal-chat-console",element: <AllBotsChatWidget/>},
            {path: "all-chatbot-agents",element: <ChatBotAgentsContainer/>},
            // {path: "all-chatbot-agents/:interpreterId",element: <ChatBotAgentsContainer/>},
            {path: "multi-agent", element:<MultiAgent/>}
          ]
        },
        {path: "admin",
        children: [
          {path:"/admin",element:<AdminDashboard/>},
          {path: "multi-agent", element:<MultiAgent/>},
          {
            path: 'model-upgrade',
            element: <ModelUpgrade/>
          },
          {path:"contact-support", element: <ContactSupport/>},
          {path: "guard-rail", element:<GuardRail/>},
          {path: "base-models", element:<BaseModels/>},
          {path: "user-management", element:<UserManagement/>},
/*
          {path: "guard-rails-list/:interpreterId", element:<GuardRailActionComponent/>}
*/

        ]},
        {
          path: 'bot-builder/bot-details/:botRecordId',
          element: <BotBuilder/>
        },
        {
          path: 'memory',
          element: <MemoryDialog/>
        },
        {
          path: 'apps',
          children: [
            {
              path: 'chat-widget',
              element: <ChatWidget/>
            },
            {
              path: 'profiles',
              children: [
                {
                  path: 'user',
                  element: <UserProfile/>,
                  children: [
                    {
                      path: 'personal',
                      element: <UserTabPersonal/>
                    }
                  ]
                },
              ]
            }
          ]
        },
        {
          path: 'bot',
          children: [
            {
              path: 'wizard',
              element: <BotCreateWizard/>
            }
          ]
        },

      ]
    },
    {
      path: "/privacy-policy/",
      element: < PrivacyPolicyPage/>
    },
    {path:"flow-customisation",element:<FlowChart/>},
    {path:"undo-redo",element:<ReactFlowWrapper/>},
    {
      path: "/terms-conditions/",
      element: < TermsConditionsPage/>
    },
    {
      path: '/maintenance',
      element: <CommonLayout/>,
      children: [
        {
          path: '404',
          element: <MaintenanceError/>
        },
        {
          path: '500',
          element: <MaintenanceError500/>
        },
        {
          path: 'under-construction',
          element: <MaintenanceUnderConstruction/>
        },
        {
          path: 'coming-soon',
          element: <MaintenanceComingSoon/>
        }
      ]
    },
    {
      path: '/',
      element: <CommonLayout layout="home"/>,
      children: [
        {
          path: 'home',
          element: <HomePageMain/>
        }
      ]
    },
    {
      path: '/',
      element: <CommonLayout layout="simple"/>,
    }
  ]
};

export default MainRoutes;
