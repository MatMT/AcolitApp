import PropTypes from 'prop-types';

export const Button = ({children, onClick, className = ''}) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 
      transition-colors ${className}`}
        >
            {children}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node,
    onClick: PropTypes.func,
    className: PropTypes.string,
};