import React from "react";
import "./Layout.css";
import "./Account.css";
import "./Transaction.css";
import "./Filter.css";
import "./Search.css";
import Data from "./BankingData";

export default class AccountComponent extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoaded: false,
      searchText: "",
      accountNo: "",
      sortedBy: "",
      transactions: {},
      rawData: [],
      pageNo: 0,
      limitPerPage: 10,
      selectedTransaction: null
    };
    this.prevPage = this.prevPage.bind(this);
    this.nextPage = this.nextPage.bind(this);
  }

  componentDidMount() {
    fetch("http://starlord.hackerearth.com/bankAccount")
      .then(res => res.json())
      .then(
        result => {
          this.processData(result);
        },
        error => {
          this.setState({
            isLoaded: true
          });
          // Process static data if error occurs due to http and https moxin
          this.processData(Data);
        }
      );
  }

  sortData(column) {
    this.state.rawData = this.state.rawData.sort((a, b) => {
      let col1, col2;
      if (column === "Balance AMT") {
        col1 = a[column];
        col2 = b[column];
      } else {
        col1 = new Date(a[column]);
        col2 = new Date(b[column]);
      }
      if (col1 < col2) {
        return 1;
      }
      if (col1 > col2) {
        return -1;
      }
      return 0;
    });
    this.processData(this.state.rawData, column);
  }

  processData(data, sortedBy = "Date") {
    const temp = {};
    data.forEach(acc => {
      if (!temp[acc["Transaction Details"]]) {
        temp[acc["Transaction Details"]] = [acc];
      } else {
        temp[acc["Transaction Details"]].push(acc);
      }
    });
    this.setState({
      accountNo: data[0]["Account No"],
      transactions: temp,
      selectedTransaction: temp ? Object.keys(temp)[0] : "",
      pageNo: 0,
      totalPages: this.getTotalPages(Object.keys(temp)),
      isLoaded: true,
      rawData: data,
      sortedBy: sortedBy
    });
  }

  getTotalPages(data) {
    const totalRecords = Object.keys(data).length;
    let totalPages = Math.floor(totalRecords / this.state.limitPerPage);
    totalPages += totalRecords % this.state.limitPerPage > 0 ? 1 : 0;
    return totalPages;
  }

  nextPage() {
    if (this.state.pageNo + 1 < this.state.totalPages) {
      this.state.selectedTransaction = Object.keys(this.state.transactions)[
        (this.state.pageNo + 1) * this.state.limitPerPage
      ];
      this.setState({
        pageNo: this.state.pageNo + 1,
        selectedTransaction: this.state.selectedTransaction
      });
    }
  }

  prevPage() {
    if (this.state.pageNo - 1 >= 0) {
      this.state.selectedTransaction = Object.keys(this.state.transactions)[
        (this.state.pageNo - 1) * this.state.limitPerPage
      ];
      this.setState({ pageNo: this.state.pageNo - 1 });
    }
  }

  render() {
    const keys = Object.keys(this.state.transactions);
    const transactionHeader = keys
      .slice(
        this.state.pageNo * this.state.limitPerPage,
        (this.state.pageNo + 1) * this.state.limitPerPage
      )
      .filter(k => {
        return (
          k.toLowerCase().indexOf(this.state.searchText.toLowerCase()) > -1
        );
      })
      .map(k => {
        return (
          <div
            className={
              this.state.selectedTransaction === k
                ? "active transaction"
                : "transaction"
            }
            key={k}
          >
            <div
              className="transaction-header"
              onClick={() => this.setState({ selectedTransaction: k })}
            >
              {k}
            </div>
          </div>
        );
      });

    let transactionBody = null;

    if (
      this.state.transactions[this.state.selectedTransaction] &&
      this.state.transactions[this.state.selectedTransaction]
    ) {
      transactionBody = this.state.transactions[
        this.state.selectedTransaction
      ].map((trans, i) => {
        return (
          <div data-content={i + 1} key={i} className="transaction-body">
            <div className="col-wrap">
              <div className="col-name">Dated On</div>
              <div className="col-value">{trans["Date"]}</div>
            </div>
            <div className="col-wrap">
              <div className="col-name">Value Date</div>
              <div className="col-value">{trans["Value Date"]}</div>
            </div>
            <div className="col-wrap">
              <div className="col-name">Withdrawal Amount</div>
              <div className="col-value">{trans["Withdrawal AMT"]}</div>
            </div>
            <div className="col-wrap">
              <div className="col-name">Deposit Amount</div>
              <div className="col-value">{trans["Deposit AMT"]}</div>
            </div>
            <div className="col-wrap">
              <div className="col-name">Balance Amount</div>
              <div className="col-value">{trans["Balance AMT"]}</div>
            </div>
          </div>
        );
      });
    }

    return (
      <div className="wrapper">
        <div className="container">
          <div className="row">
            <div className="col header">
              <div className="account">
                <div className="name">Account</div>
                <div className="content">
                  {this.state.accountNo ? (
                    <div className="account-number">{this.state.accountNo}</div>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col toolbar">
              <div
                className={
                  this.state.searchText.length > 0
                    ? "search-box searched"
                    : "search-box"
                }
              >
                <input
                  type="text"
                  value={this.state.searchText}
                  placeholder="Search for Transactions"
                  onChange={$event =>
                    this.setState({
                      searchText: $event.target.value,
                      pageNo: 0
                    })
                  }
                />
                <div
                  className="icon"
                  onClick={() => this.setState({ searchText: "" })}
                />
              </div>
              <div className="filter-box">
                Sort By:
                <button
                  className={this.state.sortedBy == "Date" ? "active" : ""}
                  onClick={() => this.sortData("Date")}
                >
                  Date
                </button>
                <button
                  className={
                    this.state.sortedBy == "Balance AMT" ? "active" : ""
                  }
                  onClick={() => this.sortData("Balance AMT")}
                >
                  Balance Amount
                </button>
                <button
                  className={
                    this.state.sortedBy == "Value Date" ? "active" : ""
                  }
                  onClick={() => this.sortData("Value Date")}
                >
                  Value date
                </button>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col header">
              <div className="content transaction-content">
                {transactionHeader.length > 0 && transactionBody ? (
                  <div className="left navigation" onClick={this.prevPage} />
                ) : (
                  ""
                )}
                {transactionHeader.length > 0 && transactionBody ? (
                  <div className="transaction-wrapper">
                    <div className="name">Transactions</div>
                    {transactionHeader}
                  </div>
                ) : (
                  ""
                )}
                {transactionHeader.length > 0 && transactionBody ? (
                  <div className="transaction-report">
                    {transactionBody ? transactionBody : ""}
                  </div>
                ) : (
                  ""
                )}
                {transactionHeader.length > 0 && transactionBody ? (
                  <div className="right navigation" onClick={this.nextPage} />
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col pageNo">
              Page No : {this.state.pageNo + 1}, Total Pages :{" "}
              {this.state.totalPages}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
