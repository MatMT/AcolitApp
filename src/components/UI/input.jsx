import React from "react";
import PropTypes from "prop-types";

export const Input = React.forwardRef(({className = '', ...props}, ref) => {
    return (
        <input
            ref={ref}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none 
      focus:ring-2 focus:ring-blue-500 ${className}`}
            {...props}
        />
    );
});

Input.displayName = 'Input';

Input.propTypes = {
    className: PropTypes.string,
}