OUTPUT_PATH = '/tmp/260e763b-0a52-41d2-9693-feb1f1687926.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided image dimensions.
    Dimensions:
    - Total Height: 9' (8' door height + 1' top gap)
    - Total Width: 14'6" (7' left section + 7'6" right section)
    - Opening (Door/Window): 7' wide by 8' high, located at the bottom-left.
    """
    
    # Clear existing objects and data to start fresh
    bpy.ops.wm.read_factory_settings(use_empty=True)

    # Define dimensions (using 1 unit = 1 foot)
    total_width = 14.5  # 7 feet + 7.5 feet
    total_height = 9.0  # 8 feet + 1 foot
    wall_thickness = 0.5 # Standard assumed thickness
    
    opening_width = 7.0
    opening_height = 8.0

    # 1. Create the Main Wall
    # Create a cube and set its dimensions to match the outer boundaries
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "Main_Wall"
    wall.dimensions = (total_width, wall_thickness, total_height)
    # Position the wall so the bottom-left corner is at the origin (0,0,0)
    wall.location = (total_width / 2, wall_thickness / 2, total_height / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 2. Create the Opening (Door/Window area)
    # This object will be used to cut a hole in the main wall
    bpy.ops.mesh.primitive_cube_add(size=1)
    opening = bpy.context.active_object
    opening.name = "Opening_Cutout"
    # Make it slightly thicker than the wall to ensure a clean boolean cut
    opening.dimensions = (opening_width, wall_thickness * 2, opening_height)
    # Position at the bottom-left corner of the wall
    opening.location = (opening_width / 2, wall_thickness / 2, opening_height / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 3. Perform Boolean Subtraction
    # Add a Boolean modifier to the wall object
    bool_mod = wall.modifiers.new(name="Subtract_Opening", type='BOOLEAN')
    bool_mod.object = opening
    bool_mod.operation = 'DIFFERENCE'
    
    # Apply the modifier to make the change permanent
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # 4. Cleanup
    # Remove the helper opening object from the scene
    bpy.data.objects.remove(opening, do_unlink=True)

    # 5. Export to GLB
    # Export the resulting mesh to a GLB file
    bpy.ops.export_scene.gltf(
        filepath='/tmp/260e763b-0a52-41d2-9693-feb1f1687926.glb', 
        export_format='GLB', 
        use_selection=False
    )

# Execute the function directly
create_wall_skeleton()