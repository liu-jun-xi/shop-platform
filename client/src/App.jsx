import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import ProductDetail from './pages/ProductDetail';
import BuyerAuth from './pages/BuyerAuth';
import MyOrders from './pages/MyOrders';
import Cart from './pages/Cart';
import Account from './pages/Account';
import Categories from './pages/Categories';
import CategoryProducts from './pages/CategoryProducts';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAccounts from './pages/admin/AdminAccounts';
import AdminBuyers from './pages/admin/AdminBuyers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminMessages from './pages/admin/AdminMessages';
import AdminSite from './pages/admin/AdminSite';
import AdminComments from './pages/admin/AdminComments';
import AdminReviews from './pages/admin/AdminReviews';
import AdminAnnouncement from './pages/admin/AdminAnnouncement';
import AdminCategories from './pages/admin/AdminCategories';
import AdminProfit from './pages/admin/AdminProfit';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="orders" element={<MyOrders />} />
        <Route path="cart" element={<Cart />} />
        <Route path="account" element={<Account />} />
        <Route path="categories" element={<Categories />} />
        <Route path="category/:id" element={<CategoryProducts />} />
      </Route>
      <Route path="login" element={<BuyerAuth mode="login" />} />
      <Route path="register" element={<BuyerAuth mode="register" />} />
      <Route path="admin/login" element={<AdminLogin />} />
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="accounts" element={<AdminAccounts />} />
        <Route path="buyers" element={<AdminBuyers />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="comments" element={<AdminComments />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="announcement" element={<AdminAnnouncement />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="profit" element={<AdminProfit />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="site" element={<AdminSite />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
