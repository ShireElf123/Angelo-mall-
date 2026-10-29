import { useHashRoute } from './router';
import { DemoStoreProvider } from './store/DemoStore';
import { Shell } from './components/Shell';
import { ToastProvider } from './components/ui';
import { HomeScreen } from './screens/customer/Home';
import { DirectoryScreen } from './screens/customer/Directory';
import { ShopPageScreen } from './screens/customer/ShopPage';
import { ChatsListScreen } from './screens/customer/ChatsList';
import { ChatScreen } from './screens/customer/ChatScreen';
import { BasketScreen } from './screens/customer/Basket';
import { OrderDetailScreen, OrdersScreen } from './screens/customer/Orders';
import { HelpScreen, PromotionDetailScreen } from './screens/customer/MiscScreens';
import { RetailerWorkspace } from './screens/retailer/RetailerWorkspace';
import { DeliveryWorkspace } from './screens/delivery/DeliveryWorkspace';
import { AdminWorkspace } from './screens/admin/AdminWorkspace';

function RoutedApp() {
  const [route, navigate] = useHashRoute();

  return (
    <Shell route={route} navigate={navigate}>
      {route.name === 'home' && <HomeScreen navigate={navigate} />}
      {route.name === 'shops' && (
        <DirectoryScreen navigate={navigate} initialQuery={route.q ?? ''} initialCategory={route.category} />
      )}
      {route.name === 'shop' && <ShopPageScreen shopId={route.shopId} navigate={navigate} />}
      {route.name === 'chats' && <ChatsListScreen navigate={navigate} />}
      {route.name === 'chat' && <ChatScreen conversationId={route.conversationId} navigate={navigate} />}
      {route.name === 'basket' && <BasketScreen orderId={route.orderId} navigate={navigate} />}
      {route.name === 'orders' && <OrdersScreen navigate={navigate} />}
      {route.name === 'order' && <OrderDetailScreen orderId={route.orderId} navigate={navigate} />}
      {route.name === 'promotion' && <PromotionDetailScreen promotionId={route.promotionId} navigate={navigate} />}
      {route.name === 'help' && <HelpScreen navigate={navigate} />}
      {route.name === 'retailer' && (
        <RetailerWorkspace tab={route.tab} conversationId={route.conversationId} navigate={navigate} />
      )}
      {route.name === 'delivery' && <DeliveryWorkspace tab={route.tab} navigate={navigate} />}
      {route.name === 'admin' && <AdminWorkspace tab={route.tab} navigate={navigate} />}
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
