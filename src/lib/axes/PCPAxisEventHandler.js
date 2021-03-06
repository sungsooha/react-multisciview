import React from "react";
import PropTypes from "prop-types";

import {
	mousePosition,
	d3Window
} from "../utils";

import {
	select,
	event as d3Event,
	mouse
} from "d3-selection";

class PCPAxisEventHandler extends React.Component {
	constructor() {
		super();
		this.state = {
			mouseInside: false,
			startY: null
		};
	}

	componentDidMount() {
		if (this.node) {
			select(this.node)
				.on("mouseenter", this.handleEnter)
				.on("mouseleave", this.handleLeave);
		}
	}

	componentWillUnmount() {
		if (this.node) {
			select(this.node)
				.on("mouseenter", null)
				.on("mouseleave", null);
		}
	}

    handleEnter = () => {
    	this.setState({ mouseInside: true }, () => {
			if (this.props.onMouseOver)
				this.props.onMouseOver(true);
		});
    }

    handleLeave = () => {
    	this.setState({ mouseInside: false }, () => {
			if (this.props.onMouseOver)
				this.props.onMouseOver(false);
		});
    }

	getMouseY = () => {
		//return Math.round(mouse(this.node)[1] - this.props.y);
		return Math.max(
			Math.round(mouse(this.node)[1]) + 0.5 * this.props.y
		, 0);
    }

    handleMouseDown = (e) => {
    	if (e.button !== 0) return;
    	if (!this.state.mouseInside) return;

		const mouseXY = mousePosition(e);
		const startY = mouseXY[1] + 1.5 * this.props.y;
		if (startY < 0) return;
		//if (startY > this.props.height + this.props.y - 12) return;

		select(d3Window(this.node))
    		.on("mousemove", this.handleRangeSelect)
    		.on("mouseup", this.handleRangeSelectEnd);

		this.setState({ startY });
    	e.preventDefault();
    }


    handleRangeSelect = () => {
    	const e = d3Event;

		const mouseY = this.getMouseY();
    	if (this.props.onRangeSelect) {
    		this.props.onRangeSelect(this.state.startY, mouseY, e);
    	}
    }

    handleRangeSelectEnd = () => {
    	const e = d3Event;
    	const mouseY = this.getMouseY();

    	if (Math.abs(mouseY - this.state.startY) < 1) {
    		this.setState({ startY: null, endY: null });
    		if (this.props.onRangeSelectCancle)
    			this.props.onRangeSelectCancle(e);
    	} else {
    		this.setState({ endY: mouseY });
    		if (this.props.onRangeSelect)
    			this.props.onRangeSelectEnd(this.state.startY, mouseY, e);
    	}

    	select(d3Window(this.node))
    		.on("mousemove", null)
    		.on("mouseup", null);

    	this.setState({ startY: null });
    }

    render() {
    	const cursor = this.state.mouseInside
    		? "react-multiview-crosshair-cursor"
    		: "react-multiview-default-cursor";

    	return <rect
    		ref={node => this.node = node}
    		className={`react-multiview-enable-interaction ${cursor}`}
    		x={this.props.x}
    		y={this.props.y}
    		width={this.props.width}
    		height={this.props.height}
    		style={{ fill: "black", opacity: 0.0 }}
    		onMouseDown={this.handleMouseDown}
    		// onClick={this.handleRangeSelectCancel}
    	/>;
    }
}

PCPAxisEventHandler.propTypes = {
	x: PropTypes.number,
	y: PropTypes.number,
	width: PropTypes.number,
	height: PropTypes.number,
	onRangeSelect: PropTypes.func,
	onRangeSelectCancle: PropTypes.func,
	onRangeSelectEnd: PropTypes.func
};

export default PCPAxisEventHandler;