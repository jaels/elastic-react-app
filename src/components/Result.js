import React, { Component } from 'react';
import '../style/App.css';


class Result extends Component {
    constructor(props) {
        super(props);
        this.state = {
            result: this.props.result
        }
    }

    render() {
        let {result, modalIsOpen} = this.state;
        let authors = result._source.authors.map((author)=> {
            return (
                <p key={author.lastname + result._id}>
                {author.firstname + " " + author.lastname}</p>
            )
        })
            return (
                <tr key={result._id}>
                <td>{result._source.title}</td>
                <td>{authors}</td>
                <td> {result._source.year}</td>
                <td><button onClick={()=>this.props.handleClickOnShowArticle(result._id)}
                className="go-to-btn">Go to article</button></td>
                </tr>
            )
    }
}

export default Result;
