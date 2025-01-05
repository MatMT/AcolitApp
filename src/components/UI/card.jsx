import PropTypes from 'prop-types';

export const Card = ({children, className = ''}) => {
    return (
        <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
            {children}
        </div>
    );
};

Card.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
};

export const CardHeader = ({children}) => {
    CardHeader.propTypes = {
        children: PropTypes.node,
    };
    return <div className="mb-4">{children}</div>;
};

export const CardTitle = ({children}) => {
    CardTitle.propTypes = {
        children: PropTypes.node,
    };
    return <h2 className="text-xl font-semibold">{children}</h2>;
};

export const CardContent = ({children}) => {
    CardContent.propTypes = {
        children: PropTypes.node,
    };
    return <div>{children}</div>;
};
