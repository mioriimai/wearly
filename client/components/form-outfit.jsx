import React from 'react';
import { Rnd } from 'react-rnd';
import AppContext from '../lib/app-context';
import Redirect from '../components/redirect';

export default class FormOutfit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addItemPopup: false,
      items: [],
      itemId: null,
      chosenItems: [],
      notes: '',
      saved: false,
      savedOutfitId: null,
      reachedToTen: false
    };

    this.handleAddButtonClick = this.handleAddButtonClick.bind(this);
    this.handlePopupLeaveButtonClick = this.handlePopupLeaveButtonClick.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleItemClick = this.handleItemClick.bind(this);
    this.handleOnDrag = this.handleOnDrag.bind(this);
    this.handleDeleteChoseItemClick = this.handleDeleteChoseItemClick.bind(this);
    this.handleNotesChange = this.handleNotesChange.bind(this);
    this.handleSaveConfirmPopupClick = this.handleSaveConfirmPopupClick.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    if (this.context.user) {
      fetch(`/api/items/${this.context.user.userId}`)
        .then(res => res.json())
        .then(items => this.setState({ items }));
    }
  }

  handleAddButtonClick() {
    if (this.state.chosenItems.length < 10) {
      this.setState({
        addItemPopup: true
      });
    } else if (this.state.chosenItems.length >= 10) {
      this.setState({
        addItemPopup: false
      });
    }
  }

  handlePopupLeaveButtonClick() {
    this.setState({
      addItemPopup: false
    });
  }

  handleMouseEnter(event) {
    if (event.target.name === undefined) {
      this.setState({
        itemId: event.target.id
      });
    } else {
      this.setState({
        itemId: event.target.name
      });
    }
  }

  handleMouseLeave() {
    this.setState({
      itemId: null
    });
  }

  handleItemClick() {
    fetch(`/api/items/${this.state.itemId}/${this.context.user.userId}`)
      .then(res => res.json())
      .then(chosenItems => {
        chosenItems.deltaX = 0;
        chosenItems.deltaY = 0;
        const newChoseItems = [...this.state.chosenItems, chosenItems];
        this.setState({
          chosenItems: newChoseItems,
          addItemPopup: false
        });
      });
  }

  handleOnDrag(event, ui) {
    // change delta X and Y and perventage
    let width;
    let height;
    if (window.innerWidth > 768) {
      width = 440;
      height = 460;
    } else if (window.innerWidth < 768) {
      width = 280;
      height = 300;
    }

    const copyChosenItems = [...this.state.chosenItems];
    const newChosenItems = [];
    const targetItemId = Number(event.target.id);
    copyChosenItems.forEach(item => {
      if (item.itemId === targetItemId) {
        const xPercent = Math.round(ui.x / width * 100);
        const yPercent = Math.round(ui.y / height * 100);
        newChosenItems.push({ ...item, deltaX: xPercent, deltaY: yPercent });
      } else {
        newChosenItems.push(item);
      }
    });
    this.setState({
      chosenItems: newChosenItems
    });
  }

  handleDeleteChoseItemClick() {
    const copyChosenItems = [...this.state.chosenItems];
    const targetId = Number(this.state.itemId);
    const newChosenItems = copyChosenItems.filter(v => v.itemId !== targetId);
    this.setState({
      chosenItems: newChosenItems
    });
  }

  handleNotesChange(event) {
    this.setState({
      notes: event.target.value
    });
  }

  handleSaveConfirmPopupClick() {

    // Use fetch to send a post request to /api/store-item-for-outfit.
    for (let i = 0; i < this.state.chosenItems.length; i++) {

      if (i < this.state.chosenItems.length - 1) {
        // Create a `new` FormData object.
        const formDataItem = new FormData();

        const deltaX = Math.round(this.state.chosenItems[i].deltaX);
        const deltaY = Math.round(this.state.chosenItems[i].deltaY);
        const { user } = this.context;

        //  Append entries to the form data object I created.
        formDataItem.append('userId', user.userId);
        formDataItem.append('outfitId', this.state.savedOutfitId);
        formDataItem.append('itemId', this.state.chosenItems[i].itemId);
        formDataItem.append('deltaX', deltaX);
        formDataItem.append('deltaY', deltaY);

        fetch('/api/store-item-for-outfit', {
          method: 'POST',
          body: formDataItem
        })
          .then(res => res.json())
          .then(data => {
            this.setState({
            });
          })
          .catch(err => console.error(err));

      } else if (i === this.state.chosenItems.length - 1) { // post the last item in the array
        // Create a `new` FormData object.
        const formDataItem = new FormData();

        const deltaX = Math.round(this.state.chosenItems[i].deltaX);
        const deltaY = Math.round(this.state.chosenItems[i].deltaY);
        const { user } = this.context;

        //  Append entries to the form data object I created.
        formDataItem.append('userId', user.userId);
        formDataItem.append('outfitId', this.state.savedOutfitId);
        formDataItem.append('itemId', this.state.chosenItems[i].itemId);
        formDataItem.append('deltaX', deltaX);
        formDataItem.append('deltaY', deltaY);

        fetch('/api/store-item-for-outfit', {
          method: 'POST',
          body: formDataItem
        })
          .then(res => res.json())
          .then(data => {
            this.setState({
              saved: !this.state.saved,
              chosenItems: [],
              savedOutfitId: null
            });
          })
          .catch(err => console.error(err));
      }
    }
  }

  handleSubmit(event) {
    // prevent the default form submission behavior.
    event.preventDefault();

    // Create a `new` FormData object.
    const formData = new FormData();
    const { user } = this.context;

    //  Append entries to the form data object.
    formData.append('userId', user.userId);
    formData.append('favorite', false);
    formData.append('notes', this.state.notes);

    // Use fetch() to send a POST request to / api / form-outfit.
    fetch('/api/form-outfit', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        this.setState({
          notes: '',
          saved: true,
          savedOutfitId: data.outfitId
        });
      })
      .catch(err => console.error(err));
  }

  render() {
    if (!this.context.user) return <Redirect to="sign-in" />;

    const chosenItemsArray = [];
    for (let i = 0; i < this.state.chosenItems.length; i++) {
      const targetedItemId = Number(this.state.itemId);

      let hoverDeleteChosenItem = 'delete-chosen-item-icon-wrapper hidden';
      if (this.state.chosenItems[i].itemId === targetedItemId) {
        hoverDeleteChosenItem = 'delete-chosen-item-icon-wrapper';
      } else {
        hoverDeleteChosenItem = 'delete-chosen-item-icon-wrapper hidden';
      }

      let defaultSize;
      if (window.innerWidth > 768) {
        defaultSize = {
          x: 0,
          y: 0,
          width: '200px',
          height: '220px',
          margin: 0
        };
      } else if (window.innerWidth < 768) {
        defaultSize = {
          x: 0,
          y: 0,
          width: '130px',
          height: '150px',
          margin: 0
        };
      }

      chosenItemsArray.push(
        <Rnd key={i}
             className='rnd'
             onMouseEnter={this.handleMouseEnter}
             onMouseLeave={this.handleMouseLeave}
             default={defaultSize}
             style={{
               backgroundImage: `url(${this.state.chosenItems[i].image})`,
               backgroundSize: 'contain',
               backgroundRepeat: 'no-repeat'
             }}
             dragAxis="both"
             enableResizing={{
               top: false,
               right: false,
               bottom: false,
               left: false,
               topRight: false,
               bottomRight: false,
               bottomLeft: false,
               topLeft: false
             }}
             bounds='parent'
             id={`${this.state.chosenItems[i].itemId}`}
             onDrag={this.handleOnDrag}
          >
          <div className={hoverDeleteChosenItem} >
            <i className='fa-regular fa-circle-xmark chosen-item' onClick={this.handleDeleteChoseItemClick}/>
          </div>
        </Rnd>
      );
    }

    const itemsArray = [];
    for (let i = 0; i < this.state.items.length; i++) {
      const targetedItemId = Number(this.state.itemId);

      let hoverClassName = 'shadow-wrapper hidden';
      if (this.state.items[i].itemId === targetedItemId) {
        hoverClassName = 'add-outfit-shadow-wrapper';
      } else {
        hoverClassName = 'add-outfit-shadow-wrapper hidden';
      }

      itemsArray.push(
        <div key={i} className="add-item-wrapper">
          <Item
            item={this.state.items[i]}
            handleMouseEnter={this.handleMouseEnter}
            handleMouseLeave={this.handleMouseLeave}
            state={this.state}
            hover={hoverClassName}
            handleItemClick={this.handleItemClick}
          />
        </div>
      );
    }

    let addItemPopup;
    if (this.state.addItemPopup === true) {
      addItemPopup = 'add-item-popup';
    } else if (this.state.addItemPopup === false) {
      addItemPopup = 'hidden';
    }

    let upToTenMessage;
    let reachedToTenMessage;
    if (this.state.chosenItems.length <= 9) {
      upToTenMessage = 'up-to-ten-message';
      reachedToTenMessage = 'hidden';
    } else if (this.state.chosenItems.length > 9) {
      upToTenMessage = 'hidden';
      reachedToTenMessage = 'reached-to-ten-message';
    }

    // show image placeholder and hide it when image is selected
    let placeholderClassName = 'outfit-image-placeholder';
    let uploadMessage = 'upload-from-camera-roll';
    if (this.state.chosenItems.length > 0) {
      placeholderClassName = 'hidden';
      uploadMessage = 'upload-from-camera-roll hidden';
    }

    // save confirm popup-window
    const popup = this.state.saved ? 'pop-up' : 'pop-up hidden';

    return (
      <>
        <form onSubmit={this.handleSubmit}>
          <div className='form-outfit-container'>
            <div className='form-outfit-white-box'>
              <div className='row'>
                <div className='column-full'>
                  <p className='form-outfit-title'>New Outfit</p>
                </div>
              </div>
              <div className='row'>
                <div className='column-half tablet'>
                  <div className='outfit-box' >
                    <div className='outfit-box-inner' >
                      {chosenItemsArray}
                      <img src="/images/image-placeholder.png" alt="placeholder" className={placeholderClassName} />

                      <p className={uploadMessage}>Add an item to create outfit.</p>
                    </div>
                  </div>
                </div>
                <div className='column-half tablet'>
                  <div className='row'>
                    <button type='button' className='add-item-to-outfit-button' onClick={this.handleAddButtonClick}><i className='fa-solid fa-plus outfit' />Add an Item</button>
                  </div>
                  <div className='row'>
                    <p className={upToTenMessage}><i className='fa-regular fa-lightbulb' />You can add up to 10 items.</p>
                    <p className={reachedToTenMessage}><i className='fa-solid fa-circle-exclamation' />You reached to 10 items.</p>
                  </div>
                  <div className='row'>
                    <label htmlFor="notes" className='outfit-notes'>Notes</label>
                  </div>
                  <div className='row'>
                    <textarea name="notes" id='outfit-notes' value={this.state.notes} onChange={this.handleNotesChange} />
                  </div>
                  <div className='row outfit-save-button-wrapper'>
                    <button type='submit' className='outfit-save-button'>SAVE</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className={addItemPopup}>
          <div className='add-item-view-container'>
            <i className='fa-solid fa-circle-arrow-right' onClick={this.handlePopupLeaveButtonClick} />
            <div className='add-item-list-wrapper'>
              {itemsArray}
            </div>
          </div>
        </div>

        <div className={popup}>
          <div className='saved-popup-text-wrapper'>
            <h1 className='successfully-saved'>Successfully saved!</h1>
            <a className='add-more-items' href='#add-outfit' onClick={this.handleSaveConfirmPopupClick}>Add More Outfits</a>
            <br />
            <a className='see-items' href='#outfits' onClick={this.handleSaveConfirmPopupClick}>See My Outfits</a>
          </div>
        </div>
      </>
    );
  }
}

function Item(props) {
  const { image, itemId } = props.item;

  return (
    <div className='item-button' >
      <div className='position'>
        <img
          src={image}
          className="add-item-image"
          onMouseEnter={props.handleMouseEnter}
          name={`${itemId}`}
        />
        <div className={props.hover} onMouseLeave={props.handleMouseLeave} onClick={props.handleItemClick}/>
      </div>
    </div>
  );
}
FormOutfit.contextType = AppContext;
