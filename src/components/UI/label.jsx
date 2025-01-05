import PropTypes from "prop-types";

export const Label = ({children, htmlFor}) => {
    return (
        <label
            htmlFor={htmlFor}
            className="block text-sm font-medium text-gray-700 mb-1"
        >
            {children}
        </label>
    );
};

Label.propTypes = {
    children: PropTypes.node,
    htmlFor: PropTypes.string,
};