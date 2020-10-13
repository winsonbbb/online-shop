import React, { Component } from "react";
import Item from "../Item/Item";
import CircularProgress from "@material-ui/core/CircularProgress";
import queryString from "query-string";
import Api from "../../Api";
import Paging from "../Paging/Paging";
import ProductsHeader from "../ProductsHeader/ProductsHeader";

// This component is responsible for fetching products.
// It determines from query string which products to fetch.
// The URL is checked on initial mount and when URL changes.
// Lot of the state for this component and its children
// lives actually in the query string (e.g., category of products, price filter).
// The flow is on user action, we modify the query string, then new products are refetched.

class ProductList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      totalItemsCount: null,
      items: [],
    };
    this.updateQueryStr = this.updateQueryStr.bind(this);
  }

  async fetchData() {
    this.setState({ loading: true });

    let parsedQueryStr = queryString.parse(this.props.location.search);
    let results = await Api.searchItems(parsedQueryStr);

    this.setState({
      items: results.data,
      loading: false,
      totalItemsCount: results.totalLength,
    });
  }

  componentDidMount() {
    this.fetchData();
  }

  updateQueryStr(newValues) {
    let currentQueryStr = queryString.parse(this.props.location.search);

    // Navigate to the new URL
    this.props.history.push(
      "/?" + queryString.stringify({ ...currentQueryStr, ...newValues })
    );
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    let currentQueryStr = queryString.parse(this.props.location.search);
    let oldQueryStr = queryString.parse(prevProps.location.search);

    let areSameObjects = (a, b) => {
      if (Object.keys(a).length !== Object.keys(b).length) return false;
      for (let key in a) {
        if (a[key] !== b[key]) return false;
      }
      return true;
    };

    // We will refetch products only when query string changes.
    if (!areSameObjects(currentQueryStr, oldQueryStr)) {
      this.fetchData();
    }
  }

  render() {
    let parsedQueryStr = queryString.parse(this.props.location.search);

    if (this.state.loading) {
      return <CircularProgress className="circular" />;
    }

    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <ProductsHeader
          parsedQueryStr={parsedQueryStr}
          updateQueryStr={this.updateQueryStr}
          totalItemsCount={this.state.totalItemsCount}
        />

        <div style={{ flex: 1 }}>
          {this.state.items.map((item) => {
            return <Item key={item.id} item={item} />;
          })}
        </div>

        <Paging
          parsedQueryStr={parsedQueryStr}
          updateQueryStr={this.updateQueryStr}
          totalItemsCount={this.state.totalItemsCount}
        />
      </div>
    );
  }
}

export default ProductList;
