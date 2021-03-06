import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { FS } from 'meteor/cfs:base-package';
import handleMethodsCallbacks from '../../../helpers/handleMethodsCallbacks';
import showMessage from '../../../helpers/showMessage';
import Avatars from '../../../api/avatars/collection';

const propTypes = {
  currentImageUrl: PropTypes.string,
  getImageUrl: PropTypes.func,
};

const defaultProps = {
  currentImageUrl: '',
  getImageUrl: () => {},
};

class ImagePicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageUrl: this.props.currentImageUrl,
    };
  }

  imageLoadedCallback = (fileObj) => {
    fileObj.once('uploaded', () => {
      this.setState({
        imageUrl: `/cfs/files/avatars/${fileObj._id}`,
        imageId: fileObj._id,
      });

      this.props.getImageUrl(this.state.imageUrl);
      this.setState({ errors: 0 });
    });
  };

  imageDeletedCallback = () => {
    this.setState({
      imageId: null,
    });
  };

  loadFile = () => {
    const file = this.image.files[0];
    if (file) {
      const fsFile = new FS.File(file);

      fsFile.owner = Meteor.userId();

      if (this.state.imageId) {
        Avatars.remove(
          { _id: this.state.imageId },
          handleMethodsCallbacks(this.imageDeletedCallback),
        );
      }

      Avatars.insert(fsFile, handleMethodsCallbacks(this.imageLoadedCallback));
    }
  };

  loadError = () => {
    const image = this.state.imageUrl;

    if (!image) return;

    if (this.state.errors < 5) {
      setTimeout(() => {
        this.setState({ imageUrl: '', errors: this.state.errors + 1 });
        this.setState({ imageUrl: image });
      }, 500);
    } else {
      showMessage('Can not load image');
    }
  };

  render() {
    return (
      <figure className="m-auto">
        <img
          src={this.state.imageUrl}
          onError={this.loadError}
          role="presentation"
          className="avatar--big"
        />
        <figcaption className="mt--10 ta-c">
          <label
            className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect"
            htmlFor="file-picker"
          ><i className="material-icons">file_upload</i> Upload image</label>
          <input
            type="file"
            id="file-picker"
            className="d-none"
            ref={(image) => { this.image = image; }}
            onChange={this.loadFile}
          />
        </figcaption>
      </figure>
    );
  }
}

ImagePicker.propTypes = propTypes;
ImagePicker.defaultProps = defaultProps;

export default ImagePicker;
