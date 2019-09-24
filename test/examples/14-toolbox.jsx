import React from "react";
import uuid from "uuid";
import styled from 'styled-components';
import _ from "lodash";
import { Responsive, WidthProvider } from "react-grid-layout";
const ResponsiveReactGridLayout = WidthProvider(Responsive);
import Draggable from "react-draggable";

const ToolBoxItem = (props) => {
  const handleDrag = (e, data) => {
    console.log('e:', e)
    console.log('data:', data)
    console.log('calling onDragInItem outside');
    const isTrue = props.checkBounds(e, data);
    if (isTrue) {
      console.log('calling onDragInItem');
      props.onDragInItem(e, data, props.item);
    }
  }

    // Note: removing this Draggable element via onTakeItem sometimes causes react warning in debug mode
    // Not an actual leak per https://github.com/mzabriskie/react-draggable/issues/390
    // However this may be causing touch version to break
    return (
      <Draggable
        onDrag={handleDrag}
        position={{ x: 0, y: 0 }}
        // bounds="window"
      >
        <ToolboxListItem>
          {props.item.i}
        </ToolboxListItem>
      </Draggable>
    );
}
const ToolBox = (props) => {
    return (
      <ToolBoxWrapper>
        <span className="toolbox__title">Toolbox</span>
        <ToolboxList>
          {props.items.map(item => (
            <ToolBoxItem
              key={item.i}
              item={item}
              checkBounds={props.checkBounds}
              onDragInItem={props.onDragInItem}
              onTakeItem={props.onTakeItem}
            />
          ))}
        </ToolboxList>
      </ToolBoxWrapper>
    );
}

const initialToolbox = {
  w: 2,
  h: 4,
  x: 2,
  y: 0,
  i: "test",
  moved: false,
  static: false,
  isDraggable: undefined,
  isResizable: undefined
};

const gridLayoutConfig = {
  cols: {
    lg: 12,
    md: 12,
    sm: 12,
    xs: 12,
    xxs: 12
  },
  rows: 40,
  gap: 10,
  paddingContainer: [0, 0],
  compactType: 'vertical'
};


const ShowcaseLayout = props => {
  const [state, setState] = React.useState({
    currentBreakpoint: "lg",
    compactType: "vertical",
    mounted: false,
    layouts: { lg: props.initialLayout },
    toolbox: { lg: [initialToolbox] }
  });

  const gridRef = React.createRef();



  React.useEffect(() => {
    setState({...state, mounted: true });
  }, [])

  const generateDOM = () => {
    return _.map(state.layouts[state.currentBreakpoint], l => {
      return (
        <div key={l.i} className={l.static ? "static" : ""}>
          {l.static ? (
            <span
              className="text"
              title="This item is static and cannot be removed or resized."
            >
              Static - {l.i}
            </span>
          ) : (
            <span className="text">{l.i}</span>
          )}
        </div>
      );
    });
  }

  const onBreakpointChange = breakpoint => {
   setState({
      ...state,
      currentBreakpoint: breakpoint,
      toolbox: {
        ...state.toolbox,
        [breakpoint]:
          state.toolbox[breakpoint] ||
          state.toolbox[state.currentBreakpoint] ||
          []
      }
    });
  };

  const onTakeItem = item => {
    console.log('onTakeItem', item)
    initialToolbox.i = uuid.v4();
    setState({
      ...state,
      layouts: {
        ...state.layouts,
        [state.currentBreakpoint]: [
          ...state.layouts[state.currentBreakpoint],
          {
            ...item
          }
        ]
      }
    });
  };


  const onLayoutChange = (layout, layouts) => {
    setState({ ...state, layouts });
  };


  const checkBounds = (e, data) => {
    const x = data.node.getBoundingClientRect().left;
    console.log('x:', x)
    const y = data.node.getBoundingClientRect().top;
    console.log('y:', y)
    const box = gridRef.current.getBoundingClientRect();
    console.log('box:', box)

    return (
      box.left < x &&
      x < box.left + box.width &&
      box.top < y &&
      y < box.top + box.height
    );
  }

  const onDragInItem = (e, data, item) => {
    onTakeItem({ ...item, continueDrag: event })
  }

    return (
      <div className="container" style={{ display: 'flex' }}>
        <div style={{ width: '80%' }} ref={gridRef}>
          <ResponsiveReactGridLayout
            {...props}
            style={{
              minHeight: '800px',
            }}
            layouts={state.layouts}
            onBreakpointChange={onBreakpointChange}
            onLayoutChange={onLayoutChange}
            rowHeight={gridLayoutConfig.rows}
            cols={gridLayoutConfig.cols}
            containerPadding={gridLayoutConfig.paddingContainer}
            compactType={gridLayoutConfig.compactType}
            // preventCollision={gridLayoutConfig.compactType}
            // WidthProvider option
            measureBeforeMount={false}
            // I like to have it animate on mount. If you don't, delete `useCSSTransforms` (it's default `true`)
            // and set `measureBeforeMount={true}`.
            useCSSTransforms={state.mounted}
          >
            {generateDOM()}
          </ResponsiveReactGridLayout>
        </div>
        <ToolBox
          items={state.toolbox[state.currentBreakpoint] || []}
          onTakeItem={onTakeItem}
          checkBounds={checkBounds}
          onDragInItem={onDragInItem}
        />
      </div>
    );
}
ShowcaseLayout.defaultProps = {
  className: "layout",
  rowHeight: 30,
  onLayoutChange: function() {},
  cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  initialLayout: []
};

module.exports = ShowcaseLayout;

if (require.main === module) {
  require("../test-hook.jsx")(module.exports);
}


const ToolboxList = styled.div`
  display: block;
`;

const ToolboxListItem = styled.div`
  display: inline-block;
  z-index: 2;
  text-align: center;
  line-height: 40px;
  cursor: pointer;
  max-width: 120px;
  min-height: 60px;
  min-width: 60px;
  word-wrap: break-word;
  padding: 10px;
  margin: 5px;
  border: 1px solid black;
  background-color: #ddd;

  .react-draggable-dragging {
    position: absolute;
  }
`;

const ToolBoxWrapper = styled.div`
  background-color: #dfd;
  width: 20%;
  height: 100%;
  position: relative;
  /* max-width: 234px; */
  margin-left: 20px;
`;