import React, {Component} from 'react';
import '../style/App.css';
import Result from './Result';
import elastic from '../elastic/elastic.js';
import Modal from 'react-modal';


class Results extends Component {
    constructor(props) {
        super(props);
        this.state = {
            results: this.props.results.hits.hits,
            total: this.props.results.hits.total,
            showModal: false,
            articleBody: ""
        }

        this.handleClickOnShowArticle = this.handleClickOnShowArticle.bind(this);
    }

    componentWillMount() {
    Modal.setAppElement('body');
    }

    componentWillReceiveProps(nextProps) {
          this.setState({
              results: nextProps.results.hits.hits,
              total: nextProps.results.hits.total
          })
      }

      handleClickOnShowArticle(id) {
          elastic.getArticle(id).then((result=> {
              this.setState({
                  articleBody: result._source.body,
                  showModal: true
              })
          }))
      }

      handleCloseModal() {
        this.setState({showModal: false});
      }

    render() {
        let {results, total, showModal, articleBody} = this.state;
        let renderResults = results.map((result, index)=> {
            return(
                <Result key={result._id}
                result={result}
                handleClickOnShowArticle={this.handleClickOnShowArticle}
                />
            )
        })
        return (
        <div>
        <Modal isOpen={showModal}>
            <button onClick={this.handleCloseModal.bind(this)}
            className="close-modal">Close Modal</button>
            <div>
                {articleBody}
            </div>
            <button onClick={this.handleCloseModal.bind(this)}
            className="close-modal">Close Modal</button>
        </Modal>
        <h4>Found {total} Results</h4>
        <table>
            <thead>
                <tr>
                    <th> Title </th>
                    <th> Authors </th>
                    <th> Year </th>
                    <th> Go to Article </th>
                </tr>
            </thead>
            <tbody>
                  {renderResults}
            </tbody>
        </table>
        </div>
        )
    }

}

export default Results;
