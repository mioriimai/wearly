import React from 'react';
import CreateOptions from './create-options';
import AppContext from '../lib/app-context';

export default class EditItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      item: null,
      preview: null,
      updatedImage: null,
      updatedCategory: null,
      updatedBrand: null,
      updatedColor: null,
      updatedNotes: '',
      saved: false,
      deleteConfirmation: false
    };

    this.fileInputRef = React.createRef();
    this.handleImageUpload = this.handleImageUpload.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
    this.handleBrandChange = this.handleBrandChange.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);
    this.handleNotesChange = this.handleNotesChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSavePopupClick = this.handleSavePopupClick.bind(this);
    this.handleDeleteConfirmPopupClick = this.handleDeleteConfirmPopupClick.bind(this);
    this.handleDeleteItem = this.handleDeleteItem.bind(this);
  }

  componentDidMount() {
    fetch(`/api/items/${this.props.itemId}/${this.context.user.userId}`)
      .then(res => res.json())
      .then(item => this.setState({ item }));
  }

  handleImageUpload(event) {
    const files = event.target.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = event => {
        this.setState({ preview: event.target.result });
      };
      reader.readAsDataURL(file);
    } else {
      this.setState({ preview: null });
    }

    this.setState({
      updatedImage: event.target.files[0].name
    });
  }

  handleCategoryChange(event) {
    this.setState({
      updatedCategory: event.target.value
    });
  }

  handleBrandChange(event) {
    this.setState({
      updatedBrand: event.target.value
    });
  }

  handleColorChange(event) {
    this.setState({
      updatedColor: event.target.value
    });
  }

  handleNotesChange(event) {
    this.setState({
      updatedNotes: event.target.value
    });
  }

  handleSubmit(event) {
    // prevent the default form submission behavior.
    event.preventDefault();

    // Create a `new` FormData object.
    const formDataObject = new FormData();

    //  Append entries to the form data object I created.
    let image;
    if (this.state.updatedImage === null) {
      image = this.state.item.image;
    } else {
      image = this.fileInputRef.current.files[0];
    }

    let category;
    if (this.state.updatedCategory === null) {
      category = this.state.item.category;
    } else {
      category = this.state.updatedCategory;
    }

    let brand;
    if (this.state.updatedBrand === null) {
      brand = this.state.item.brand;
    } else {
      brand = this.state.updatedBrand;
    }

    let color;
    if (this.state.updatedColor === null) {
      color = this.state.item.color;
    } else {
      color = this.state.updatedColor;
    }

    let notes;
    if (this.state.updatedNotes === null) {
      notes = this.state.item.notes;
    } else {
      notes = this.state.updatedNotes;
    }
    const { user } = this.context;
    formDataObject.append('image', image);
    formDataObject.append('category', category);
    formDataObject.append('brand', brand);
    formDataObject.append('color', color);
    formDataObject.append('notes', notes);
    formDataObject.append('userId', user.userId);

    fetch(`/api/items/${this.props.itemId}/${this.context.user.userId}`, {
      method: 'PATCH',
      body: formDataObject
    })
      .then(res => res.json())
      .then(data => {
        this.setState({
          saved: true
        });
        this.fileInputRef.current.value = null;
      })
      .catch(err => console.error(err));
  }

  handleSavePopupClick() {
    this.setState({
      saved: !this.state.saved
    });
  }

  handleDeleteConfirmPopupClick() {
    this.setState({
      deleteConfirmation: !this.state.deleteConfirmation
    });
  }

  handleDeleteItem() {
    fetch(`/api/items/${this.props.itemId}/${this.context.user.userId}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .catch(err => console.error(err));
  }

  render() {
    if (!this.state.item) return null;

    const { image, category, brand, color, notes, itemId } = this.state.item;

    const previewImage = this.state.preview;
    let preview = '';
    let showedImageClassName = 'chosen-image';
    if (previewImage != null) {
      preview = (
        <img src={previewImage} className='chosen-image' />
      );
      showedImageClassName = 'chosen-image hidden';
    }

    let valueOfCategory = category;
    if (this.state.updatedCategory !== null) {
      valueOfCategory = this.state.updatedCategory;
    }

    let valueOfBrand = brand;
    if (this.state.updatedBrand !== null) {
      valueOfBrand = this.state.updatedBrand;
    }

    let valueOfColor = color;
    if (this.state.updatedColor !== null) {
      valueOfColor = this.state.updatedColor;
    }

    let valueOfNotes = notes;
    if (this.state.updatedNotes !== null) {
      valueOfNotes = this.state.updatedNotes;
    }

    const savedPopup = this.state.saved ? 'pop-up' : 'pop-up hidden';
    const deleteConfirmPopup = this.state.deleteConfirmation ? 'pop-up' : 'pop-up hidden';

    return (

      <>
        <form onSubmit={this.handleSubmit}>
          <div className='form-item-container'>
            <div className='form-item-white-box'>
              <div className='row'>
                <div className='column-full'>
                  <p className='form-item-title'>Edit Item</p>
                </div>
              </div>
              <div className='row'>
                <div className='column-half add-padding-left'>
                  <div className='row item-image-wrapper'>
                    <img src={ image } alt={ itemId } className={showedImageClassName} />
                    {preview}
                  </div>
                  <div className='row file-upload-wrapper'>
                    <input type="file" name='image' ref={this.fileInputRef} accept=".png, .jpg, .jpeg, .gif" onChange={this.handleImageUpload} className='choose-file' />
                  </div>
                </div>
                <div className='column-half add-padding-right'>
                  <div className='row each-row'>
                    <div className='column-two-fifth'>
                      <p className='form-item-category'>Category</p>
                    </div>
                    <div className='column-three-fifth position-right'>
                      <select name="category" id="category-dropdown-menu" value={valueOfCategory} onChange={this.handleCategoryChange} >
                        <CreateOptions options="category" />
                      </select>
                    </div>
                  </div>
                  <div className='row each-row'>
                    <div className='column-three-ten'>
                      <p className='form-item-brand'>Brand</p>
                    </div>
                    <div className='column-seven-ten position-right'>
                      <select name="brand" id="brand-dropdown-menu" value={valueOfBrand} onChange={this.handleBrandChange} >
                        <CreateOptions options="brand" />
                      </select>
                    </div>
                  </div>
                  <div className='row each-row'>
                    <div className='column-three-ten'>
                      <p className='form-item-color'>Color</p>
                    </div>
                    <div className='column-seven-ten position-right'>
                      <select name="color" id="color-dropdown-menu" value={valueOfColor} onChange={this.handleColorChange} >
                        <CreateOptions options="color" />
                      </select>
                    </div>
                  </div>
                  <div className='row'>
                    <label htmlFor="notes" className='form-item-notes'>Notes</label>
                  </div>
                  <div className='row'>
                    <textarea name="notes" id="notes" value={valueOfNotes} onChange={this.handleNotesChange} />
                  </div>
                  <div className='row'>
                    <div className='mobile-column-half'>
                      <button type='button' className='item-delete-confirm-button' onClick={this.handleDeleteConfirmPopupClick}>
                        <i className="fa-regular fa-trash-can" />
                        Delete</button>
                    </div>
                    <div className='mobile-column-half'>
                      <div className='item-save-button-wrapper'>
                        <button type='submit' className='item-save-button'>SAVE</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className={savedPopup}>
          <div className='saved-popup-text-wrapper'>
            <h1 className='successfully-saved'>Successfully saved!</h1>
            <a className='add-more-items' href='#add-item' onClick={this.handleSavePopupClick}>Add More Items</a>
            <br />
            <a className='see-items' href='#items' onClick={this.handleSavePopupClick}>See My Items</a>
          </div>
        </div>

        <div className={deleteConfirmPopup}>
          <div className='saved-popup-text-wrapper'>
            <h1 className='delete-confirm-message'>Are you sure you want to delete this item? <br/>This process can&rsquo;t be undone.</h1>
            <button className='cancel-delete-button' type='button' onClick={this.handleDeleteConfirmPopupClick} >Cancel</button>
            <a className='delete-item-button' href='#items' onClick={this.handleDeleteItem} >Delete</a>
          </div>
        </div>
      </>
    );
  }
}
EditItem.contextType = AppContext;
