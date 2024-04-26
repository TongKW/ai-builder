## Pipeline AI sandbox builder

### How to create a node
1. create your node component in components/nodes/services. There should be 3 building blocks:
  - Node (for react-flow to integrate)
  - NodeUi (icon, hover description, etc.)
  - NodeSelect (such that it can be selected in node-select panel)

2. integrate NodeSelect in components/panel/node-select.tsx so that your created node can be selected into the flow graph

3. make sure a version of this node exists in infrastructure side before you commit to web interface