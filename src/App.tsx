import { lazy, Suspense, type ReactNode } from 'react';
import { useHashRoute } from './router';
import { DemoStoreProvider } from './store/DemoStore';
import { Shell } from './components/Shell';
import { ToastProvider } from './components/ui';

// Keep role and customer workspaces out of the first download. Each route loads
// its screen only when visited; shared shell/store code stays in the app shell.
const HomeScreen = lazy(() => import('./screens/customer/Home').then((m) => ({ default: m.HomeScreen })));
const DirectoryScreen = lazy(() => import('./screens/customer/Directory').then((m) => ({ default: m.DirectoryScreen })));
const ShopPageScreen = lazy(() => import('./screens/customer/ShopPage').then((m) => ({ default: m.ShopPageScreen })));
const ChatsListScreen = lazy(() => import('./screens/customer/ChatsList').then((m) => ({ default: m.ChatsListScreen })));
const ChatScreen = lazy(() => import('./screens/customer/ChatScreen').then((m) => ({ default: m.ChatScreen })));
const BasketScreen = lazy(() => import('./screens/customer/Basket').then((m) => ({ default: m.BasketScreen })));
const OrdersScreen = lazy(() => import('./screens/customer/Orders').then((m) => ({ default: m.OrdersScreen })));
const OrderDetailScreen = lazy(() => import('./screens/customer/Orders').then((m) => ({ default: m.OrderDetailScreen })));
const PromotionDetailScreen = lazy(() => import('./screens/customer/MiscScreens').then((m) => ({ default: m.PromotionDetailScreen })));
const HelpScreen = lazy(() => import('./screens/customer/MiscScreens').then((m) => ({ default: m.HelpScreen })));
const RetailerWorkspace = lazy(() => import('./screens/retailer/RetailerWorkspace').then((m) => ({ default: m.RetailerWorkspace })));
const DeliveryWorkspace = lazy(() => import('./screens/delivery/DeliveryWorkspace').then((m) => ({ default: m.DeliveryWorkspace })));
const AdminWorkspace = lazy(() => import('./screens/admin/AdminWorkspace').then((m) => ({ default: m.AdminWorkspace })));

function RoutedApp() {
  const [route, navigate] = useHashRoute();
  let screen: ReactNode;

  switch (route.name) {
    case 'home':
      screen = <HomeScreen navigate={navigate} />;
      break;
    case 'shops':
      screen = <DirectoryScreen navigate={navigate} initialQuery={route.q ?? ''} initialCategory={route.category} />;
      break;
    case 'shop':
      screen = <ShopPageScreen shopId={route.shopId} navigate={navigate} />;
      break;
    case 'chats':
      screen = <ChatsListScreen navigate={navigate} />;
      break;
    case 'chat':
      screen = <ChatScreen conversationId={route.conversationId} navigate={navigate} />;
      break;
    case 'basket':
      screen = <BasketScreen orderId={route.orderId} navigate={navigate} />;
      break;
    case 'orders':
      screen = <OrdersScreen navigate={navigate} />;
      break;
    case 'order':
      screen = <OrderDetailScreen orderId={route.orderId} navigate={navigate} />;
      break;
    case 'promotion':
      screen = <PromotionDetailScreen promotionId={route.promotionId} navigate={navigate} />;
      break;
    case 'help':
      screen = <HelpScreen navigate={navigate} />;
      break;
    case 'retailer':
      screen = <RetailerWorkspace tab={route.tab} conversationId={route.conversationId} navigate={navigate} />;
      break;
    case 'delivery':
      screen = <DeliveryWorkspace tab={route.tab} navigate={navigate} />;
      break;
    case 'admin':
      screen = <AdminWorkspace tab={route.tab} navigate={navigate} />;
      break;
  }

  return (
    <Shell route={route} navigate={navigate}>
      <Suspense fallback={<div className="route-loading" role="status" aria-live="polite">Loading demo screen…</div>}>
        {screen}
      </Suspense>
    </Shell>
  );
}

export default function App() {
  return (
    <DemoStoreProvider>
      <ToastProvider>
        <RoutedApp />
      </ToastProvider>
    </DemoStoreProvider>
  );
}
