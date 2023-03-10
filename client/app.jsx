import React from 'react';
import Home from './pages/home';
import FormItem from './components/form-item';
import FormOutfit from './components/form-outfit';
import EditItem from './components/edit-item';
import EditOutfit from './components/edit-outfit';
import Items from './components/items';
import Outfits from './components/outfits';
import Favorites from './components/favorites';
import Navbar from './components/navbar';
import parseRoute from './lib/parse-route';
import PageContainer from './components/page-container';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      route: parseRoute(window.location.hash)
    };
  }

  componentDidMount() {
    window.addEventListener('hashchange', () => {
      this.setState({
        route: parseRoute(window.location.hash)
      });
    });
  }

  renderPage() {
    const { route } = this.state;
    if (route.path === 'home' || route.path === '') {
      return <Home />;
    }
    if (route.path === 'add-item') {
      return <FormItem title="New Item" />;
    }
    if (route.path === 'items') {
      return <Items />;
    }
    if (route.path === 'item') {
      const itemId = route.params.get('itemId');
      return <EditItem itemId={itemId} />;
    }
    if (route.path === 'favorites') {
      return <Favorites />;
    }
    if (route.path === 'add-outfit') {
      return <FormOutfit />;
    }
    if (route.path === 'outfits') {
      return <Outfits />;
    }
    if (route.path === 'outfit') {
      const outfitId = route.params.get('outfitId');
      return <EditOutfit outfitId={outfitId} />;
    }

  }

  render() {
    return (
      <>
        <Navbar />
        <PageContainer>
          { this.renderPage()}
        </PageContainer>
      </>
    );
  }
}
