export default props =>
  props.images.map((image, i) => {
    let imageStyle = {
      width: '168px',
      height: '168px',
      margin: '0 auto',
      backgroundImage: `url(${image})`,
      backgroundSize: 'cover',
      backgroundPosition: '50%',
    }

    return (
      <div  key={i} className='fade-in' style={imageStyle}>
        {image !== '' && <div onClick={() => props.removeImage()} className='delete'>
          <p>✕</p>
        </div>}
      </div>
    )
  })
