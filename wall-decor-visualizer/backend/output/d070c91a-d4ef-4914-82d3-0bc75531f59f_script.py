OUTPUT_PATH = '/tmp/d070c91a-d4ef-4914-82d3-0bc75531f59f.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the wall skeleton based on the provided image dimensions.
    Dimensions used (in feet):
    - Total Wall Height: 9'
    - Total Wall Width: 14'6" (7' + 7'6")
    - Opening (Door/Window) Width: 7'
    - Opening (Door/Window) Height: 8'
    - Gap above opening: 1'
    """
    
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Dimensions in feet (1 unit = 1 foot)
    wall_width = 14.5  # 7' + 7.5'
    wall_height = 9.0
    wall_thickness = 0.5  # Standard assumed thickness
    
    opening_width = 7.0
    opening_height = 8.0
    
    # 1. Create the Main Wall
    # Positioned so the bottom-left-front corner is at (0,0,0)
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "Main_Wall"
    
    # Scale and position
    wall.scale = (wall_width, wall_thickness, wall_height)
    wall.location = (wall_width / 2, wall_thickness / 2, wall_height / 2)
    
    # Apply transformations
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 2. Create the Opening (Cutter)
    # The opening is on the left side, starting from the floor
    bpy.ops.mesh.primitive_cube_add(size=1)
    cutter = bpy.context.active_object
    cutter.name = "Opening_Cutter"
    
    # Scale and position (cutter is made thicker to ensure clean boolean)
    cutter.scale = (opening_width, wall_thickness * 2, opening_height)
    cutter.location = (opening_width / 2, wall_thickness / 2, opening_height / 2)
    
    # Apply transformations
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 3. Perform Boolean Operation
    # Subtract the opening from the main wall
    bool_mod = wall.modifiers.new(name="Wall_Opening", type='BOOLEAN')
    bool_mod.object = cutter
    bool_mod.operation = 'DIFFERENCE'
    
    # Apply the modifier
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # 4. Clean up the cutter object
    bpy.ops.object.select_all(action='DESELECT')
    cutter.select_set(True)
    bpy.ops.object.delete()

    # 5. Export to GLB
    # Exporting the entire scene (which now only contains the wall skeleton)
    bpy.ops.export_scene.gltf(
        filepath='/tmp/d070c91a-d4ef-4914-82d3-0bc75531f59f.glb',
        export_format='GLB',
        use_selection=False
    )

# Execute the function directly
create_wall_skeleton()